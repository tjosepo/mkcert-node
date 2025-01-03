import { MKCERT_BINARY_PATH } from "./platform.js";
import { dirname } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const MKCERT_VERSION = "v1.4.4";

interface Binary {
  url: string;
  sha256: string;
}

const binaries: Record<string, Record<string, Binary | undefined> | undefined> = {
  "win32": {
    "x64": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=windows/amd64`,
      sha256: "D2660B50A9ED59EADA480750561C96ABC2ED4C9A38C6A24D93E30E0977631398"
    },
    "arm64": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=windows/arm64`,
      sha256: "793747256C562622D40127C8080DF26ADD2FB44C50906CE9DB63B42A5280582E"
    }
  },
  "darwin": {
    "x64": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=darwin/amd64`,
      sha256: "A32DFAB51F1845D51E810DB8E47DCF0E6B51AE3422426514BF5A2B8302E97D4E"
    },
    "arm64": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=darwin/arm64`,
      sha256: "C8AF0DF44BCE04359794DAD8EA28D750437411D632748049D08644FFB66A60C6"
    }
  },
  "linux": {
    "x64": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=linux/amd64`,
      sha256: "6D31C65B03972C6DC4A14AB429F2928300518B26503F58723E532D1B0A3BBB52"
    },
    "arm": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=linux/arm`,
      sha256: "2F22FF62DFC13357E147E027117724E7CE1FF810E30D2B061B05B668ECB4F1D7"
    },
    "arm64": {
      url: `https://dl.filippo.io/mkcert/${MKCERT_VERSION}?for=linux/arm64`,
      sha256: "B98F2CC69FD9147FE4D405D859C57504571ADEC0D3611C3EEFD04107C7AC00D0"
    }
  }
};

export function getBinaryInfo() {
  const binary = binaries[process.platform]?.[process.arch];

  if (!binary) {
    throw new Error(`Unsupported platform: ${process.platform}/${process.arch}`);
  }

  return binary;
}

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