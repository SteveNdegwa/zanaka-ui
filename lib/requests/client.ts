type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProxyRequestPayload {
  path: string;
  method: RequestMethod;
  data?: object;
  params?: object;
}

export class APIClient {
  private proxyUrl = "/api/proxy";
  private timeout = 30000;

  private async request<T>(
    method: RequestMethod,
    path: string,
    data?: object,
    params?: object,
  ): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const payload: ProxyRequestPayload = {
      method,
      path,
      data,
      params,
    };

    try {
      const res = await fetch(this.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      clearTimeout(timeoutId);

      const json = await res.json();

      if (res.status === 401 || json?.success === false && res.status === 401) {
        if (typeof window !== "undefined") {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(`/auth?next=${next}`);
        }

        return {
          success: false,
          error: "Unauthorized",
          message: "Redirecting to login",
        };
      }

      if (!res.ok || json.success === false) {
        return {
          success: false,
          error: json.error || "An error occurred",
          message: json.message,
        };
      }

      return { success: true, data: json.data ?? json };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return { success: false, error: err.message || "Network error" };
    }
  }

  public get<T>(path: string, params?: object) {
    return this.request<T>("GET", path, undefined, params);
  }

  public post<T>(path: string, data?: object, params?: object) {
    return this.request<T>("POST", path, data, params);
  }

  public put<T>(path: string, data?: object, params?: object) {
    return this.request<T>("PUT", path, data, params);
  }

  public delete<T>(path: string, params?: object) {
    return this.request<T>("DELETE", path, undefined, params);
  }
}

export const apiClient = new APIClient();
