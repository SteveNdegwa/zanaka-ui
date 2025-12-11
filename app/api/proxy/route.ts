import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import forge from "node-forge";

const BASE_URL = process.env.BASE_BACKEND_URL!;
const ENCRYPT_TO_BACKEND = process.env.ENCRYPT_TO_BACKEND === "1";

export async function POST(req: NextRequest) {
  try {
    const { path, method = "POST", data, params } = await req.json();
    if (!path) {
      return NextResponse.json({ success: false, error: "path is required" }, { status: 400 });
    }

    const url = BASE_URL.replace(/\/+$/, "") + (path.startsWith("/") ? path : "/" + path);

    const headers: Record<string, string> = {
      "X-Api-Key": process.env.BACKEND_API_KEY || "",
      "Content-Type": "application/json",
    };
    const browserCookies = req.headers.get("cookie");
    if (browserCookies) headers["Cookie"] = browserCookies;

    let requestData = data;

    if (ENCRYPT_TO_BACKEND && data) {
      const backendPublicKey = process.env.BACKEND_PUBLIC_KEY!;
      const publicKey = forge.pki.publicKeyFromPem(backendPublicKey);
      const encrypted = publicKey.encrypt(JSON.stringify(data), "RSA-OAEP");
      requestData = forge.util.encode64(encrypted);
      headers["x-encrypted"] = "1";
    } else {
      headers["x-encrypted"] = "0";
    }

    const backendResponse = await axios.request({
      url,
      method,
      headers,
      validateStatus: () => true,
      params,
      data: requestData,
    });

    let responseData = backendResponse.data;

    if (backendResponse.headers["x-encrypted"] === "1") {
      const privateKey = forge.pki.privateKeyFromPem(process.env.BACKEND_PRIVATE_KEY!);
      responseData = JSON.parse(
        privateKey.decrypt(forge.util.decode64(responseData.data), "RSA-OAEP")
      );
    }

    // Handle Set-Cookie headers properly
    const setCookieHeader = backendResponse.headers["set-cookie"];
    const responseHeaders: HeadersInit = new Headers();
    responseHeaders.set("Content-Type", "application/json");

    // Forward multiple Set-Cookie headers
    if (setCookieHeader) {
      if (Array.isArray(setCookieHeader)) {
        setCookieHeader.forEach(cookie => responseHeaders.append("Set-Cookie", cookie));
      } else {
        responseHeaders.append("Set-Cookie", setCookieHeader);
      }
    }

    return new NextResponse(JSON.stringify(responseData), {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Proxy error" },
      { status: 500 }
    );
  }
}

export { POST as GET };
export { POST as PUT };
export { POST as PATCH };
export { POST as DELETE };
