import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const MKCERT_BINARY_PATH = process.env.MKCERT_BINARY_PATH || join(fileURLToPath(import.meta.url), `../dist/bin/${process.platform}-${process.arch}/${process.platform === "win32" ? "mkcert.exe" : "mkcert"}`);
