import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path'
import { cwd } from 'node:process';

const VERSION = "0.1.0";

interface Platform {
  os: "win32" | "darwin" | "linux";
  cpu: "x64" | "arm64" | "arm";
}

const platforms = [
  { os: "win32", cpu: "arm64" },
  { os: "win32", cpu: "x64" },
  { os: "darwin", cpu: "x64" },
  { os: "darwin", cpu: "arm64" },
  { os: "linux", cpu: "x64" },
  { os: "linux", cpu: "arm64" },
]

const PLATFORM_DIR = join(import.meta.dirname, "../packages/@mkcert-node");
const SOURCE_DIR = join(import.meta.dirname, "../mkcert");

async function buildPlatform(os: string, cpu: string) {
  const dir = join(PLATFORM_DIR, `${os}-${cpu}`);
  const binDir = join(dir, "bin");
  const binPath = join(binDir, os === "win32" ? "mkcert.exe" : "mkcert");

  const GOOS: Record<Platform["os"], string> = {
    "win32": "windows",
    "darwin": "darwin",
    "linux": "linux"
  }

  const GOARCH: Record<Platform["cpu"], string> = {
    "arm": "arm",
    "arm64": "arm64",
    "x64": "amd64"
  }

  await mkdir(binDir, { recursive: true });

  console.log(`Building ${relative(cwd(), dir)}`);

  spawnSync("go", ["build", "-o", binPath], {
    cwd: SOURCE_DIR,
    env: { ...process.env, GOOS: GOOS[os], GOARCH: GOARCH[cpu] },
    stdio: "inherit"
  });
}

for (const platform of platforms) {
  await buildPlatform(platform.os, platform.cpu);
}