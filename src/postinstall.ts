import { MKCERT_BINARY_PATH, getBinaryInfo } from "./platform";
import { dirname } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

async function toSHA256(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buffer);

  return new Uint8Array(hash)
    .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
    .toUpperCase();
}

export async function installBinary() {
  const { url, sha256 } = getBinaryInfo();

  if (existsSync(MKCERT_BINARY_PATH)) {
    return;
  }

  const request = await fetch(url);

  if (!request.ok) {
    throw new Error(`Failed to download mkcert: ${request.statusText}`);
  }

  const binary = await request.arrayBuffer();

  // Verify the SHA256 hash to make sure we downloaded the right binary.
  const hash = await toSHA256(binary);
  if (hash !== sha256) {
    throw new Error(`Downloaded version of mkcert does not match hash: Expected "${sha256}", received "${hash}"`);
  }

  mkdirSync(dirname(MKCERT_BINARY_PATH), { recursive: true });
  writeFileSync(MKCERT_BINARY_PATH, new DataView(binary));
}

installBinary();