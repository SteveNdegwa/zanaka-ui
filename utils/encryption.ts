import forge from "node-forge";

export function encryptRSA(data: any, publicKeyPem: string) {
  if (!publicKeyPem) throw new Error("Public key must be provided");
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(JSON.stringify(data), "RSA-OAEP");
  return forge.util.encode64(encrypted);
}

export function decryptRSA(encryptedData: string, privateKeyPem: string) {
  if (!privateKeyPem) throw new Error("Private key must be provided");
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const decrypted = privateKey.decrypt(forge.util.decode64(encryptedData), "RSA-OAEP");
  return JSON.parse(decrypted);
}
