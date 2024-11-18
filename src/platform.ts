import { join } from "node:path";

const MKCERT_VERSION = "v1.4.4";
export const MKCERT_BINARY_PATH = process.env.MKCERT_BINARY_PATH || join(__dirname, `../dist/bin/${process.platform}-${process.arch}/${process.platform === "win32" ? "mkcert.exe" : "mkcert"}`);

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

