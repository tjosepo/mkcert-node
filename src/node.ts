import {
  type ChildProcess,
  spawn,
  spawnSync,
  SpawnSyncReturns,
} from "node:child_process";
import { generateBinPath } from "./platform";

let binPath: string | undefined = undefined;
function getBinaryPath() {
  if (!binPath) {
    binPath = generateBinPath();
  }
  return binPath;
}

function promisify(child: ChildProcess): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let stderr = "";
    child.stderr?.on("data", (data) => (stderr += data));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr));
      }
    });
  });
}

function throwIfError(result: SpawnSyncReturns<Buffer>) {
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.toString());
  }
}

/** Install the local CA in the system trust store. */
export function install(): Promise<void> {
  return promisify(spawn(getBinaryPath(), ["-install"]));
}

/** Install the local CA in the system trust store. */
export function installSync(): void {
  throwIfError(spawnSync(getBinaryPath(), ["-install"]));
}

/** Uninstall the local CA (but do not delete it). */
export function uninstall() {
  return promisify(spawn(getBinaryPath(), ["-uninstall"]));
}

/** Uninstall the local CA (but do not delete it). */
export function uninstallSync() {
  throwIfError(spawnSync(getBinaryPath(), ["-uninstall"]));
}

export type TrustStore = "system" | "nss" | "java";

export interface MkcertGenerateOptions {
  /** Custom hosts to generate the certificates for (ex: `"localhost"`) */
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
  /** Install the local CA in the system trust store. (default: `false`) */
  install?: boolean;
  cwd?: string;
}

function toArgs(options: MkcertGenerateOptions): string[] {
  const {
    hosts,
    certFile,
    keyFile,
    p12File,
    client,
    ecdsa,
    pkcs12,
    install = true,
  } = options;

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

  hosts.forEach((host) => args.push(host));

  return args;
}

function toEnv(options: MkcertGenerateOptions) {
  const { caroot, trustStores } = options;

  const env: Record<string, string> = {};

  if (caroot) {
    env.CAROOT = caroot;
  }

  if (trustStores) {
    env.TRUST_STORES = trustStores.join(",");
  }

  return { ...process.env, ...env };
}

/** Generate a certificate. */
export function generate(options: MkcertGenerateOptions): Promise<void> {
  const { cwd = process.cwd() } = options;

  const args = toArgs(options);
  const env = toEnv(options);

  return promisify(spawn(getBinaryPath(), args, { cwd, env }));
}

/** Generate a certificate. */
export function generateSync(options: MkcertGenerateOptions): void {
  const { cwd = process.cwd() } = options;

  const args = toArgs(options);
  const env = toEnv(options);

  throwIfError(spawnSync(getBinaryPath(), args, { cwd, env }));
}

/** Return the CA certificate and key storage location. */
export async function caroot(): Promise<string> {
  const child = spawn(getBinaryPath(), ["-CAROOT"]);

  let output = "";
  child.stdout.on("data", (data) => (output += data));

  await promisify(child);

  return output.trim();
}

/** Return the CA certificate and key storage location. */
export function carootSync(): string {
  const result = spawnSync(getBinaryPath(), ["-CAROOT"]);

  throwIfError(result);

  let output = "";
  result.output.filter(Boolean).forEach((data) => (output += data));

  return output.trim();
}
