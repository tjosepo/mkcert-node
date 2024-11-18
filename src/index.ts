import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { MKCERT_BINARY_PATH } from "./platform";

function promisify(child: ChildProcess): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
}

/** Install the local CA in the system trust store. */
export function install(): Promise<void> {
  return promisify(spawn(MKCERT_BINARY_PATH, ["-install"]));
}

/** Install the local CA in the system trust store. */
export function installSync(): void {
  spawnSync(MKCERT_BINARY_PATH, ["-install"]);
}

/** Uninstall the local CA (but do not delete it). */
export function uninstall() {
  return promisify(spawn(MKCERT_BINARY_PATH, ["-uninstall"]));
}

/** Uninstall the local CA (but do not delete it). */
export function uninstallSync() {
  spawnSync(MKCERT_BINARY_PATH, ["-uninstall"]);
}

export type TrustStore = "system" | "nss" | "java";

export interface MkcertGenerateOptions {
  hosts: string[];
  /** Customize the output paths. */
  certFile?: string;
  /** Customize the output paths. */
  keyFile?: string;
  /** Customize the output paths. */
  p12File?: string;
  /** Generate a certificate for client authentication. */
  client?: boolean;
  /** Generate a certificate with an ECDSA key. */
  ecdsa?: boolean;
  /** Generate a ".p12" PKCS #12 file, also know as a ".pfx" file, containing certificate and key for legacy applications. */
  pkcs12?: boolean;
  /** Set the CA certificate and key storage location. (This allows maintaining multiple local CAs in parallel.) */
  caroot?: string;
  /** A comma-separated list of trust stores to install the local root CA into. Options are: `"system"`, `"java"` and `"nss"` (includes Firefox). Autodetected by default. */
  trustStores?: TrustStore[];
  /** Install the local CA in the system trust store. (default: `true`) */
  install?: boolean;
  cwd?: string;
}

function toArgs(options: MkcertGenerateOptions): string[] {
  const { hosts, certFile, keyFile, p12File, client, ecdsa, pkcs12, install = true } = options;

  const args: string[] = [];

  if (certFile) {
    args.push("-cert-file", certFile);
  }

  if (keyFile) {
    args.push("-key-file", keyFile);
  }

  if (p12File) {
    args.push("-p12-file", p12File);
  }

  if (client) {
    args.push("-client");
  }

  if (ecdsa) {
    args.push("-ecdsa");
  }

  if (pkcs12) {
    args.push("-pkcs12");
  }

  if (install) {
    args.push("-install");
  }

  hosts.forEach(host => args.push(host));

  return args;
}

function toEnv(options: MkcertGenerateOptions): Record<string, string> {
  const { caroot, trustStores } = options;

  const env: Record<string, string> = {};

  if (caroot) {
    env.CAROOT = caroot;
  }

  if (trustStores) {
    env.TRUST_STORES = trustStores.join(",");
  }

  return env;
}

/** Generate a certificate. */
export function generate(options: MkcertGenerateOptions): Promise<void> {
  const { cwd = process.cwd() } = options;

  const args = toArgs(options);
  const env = toEnv(options);

  return promisify(spawn(MKCERT_BINARY_PATH, args, { cwd, env }));
}

/** Generate a certificate. */
export function generateSync(options: MkcertGenerateOptions): void {
  const { cwd = process.cwd() } = options;

  const args = toArgs(options);
  const env = toEnv(options);

  spawnSync(MKCERT_BINARY_PATH, args, { cwd, env });
}

/** Return the CA certificate and key storage location. */
export async function caroot(): Promise<string> {
  const child = spawn(MKCERT_BINARY_PATH, ["-CAROOT"]);

  let output = "";
  child.stdout.on("data", data => (output += data));

  await promisify(child);

  return output.trim();
}

/** Return the CA certificate and key storage location. */
export function carootSync(): string {
  const result = spawnSync(MKCERT_BINARY_PATH, ["-CAROOT"]);

  let output = "";
  result.output.filter(Boolean).forEach(data => (output += data));

  return output.trim();
}