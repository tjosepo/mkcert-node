const knownWindowsBinaries: Record<string, string> = {
  "win32 arm64": "@mkcert/win32-arm64",
  "win32 x64": "@mkcert/win32-x64",
};

const knownUnixBinaries: Record<string, string> = {
  "darwin arm64": "@mkcert/darwin-arm64",
  "darwin x64": "@mkcert/darwin-x64",
  "linux arm64": "@mkcert/linux-arm64",
  "linux x64": "@mkcert/linux-x64",
};

function getBinaryInfo() {
  const platformKey = `${process.platform} ${process.arch}`;

  if (platformKey in knownWindowsBinaries) {
    return {
      pkg: knownWindowsBinaries[platformKey],
      subpath: "bin/mkcert.exe",
    };
  }

  if (platformKey in knownUnixBinaries) {
    return {
      pkg: knownUnixBinaries[platformKey],
      subpath: "bin/mkcert",
    };
  }

  throw new Error(`Unsupported platform: ${platformKey}`);
}

export function generateBinPath() {
  const { pkg, subpath } = getBinaryInfo();
  try {
    return require.resolve(`${pkg}/${subpath}`);
  } catch {
    throw new Error(
      `The package "${pkg}" could not be found, and is needed by @mkcert/node.

If you are installing esbuild with npm, make sure that you don't specify the
"--no-optional" or "--omit=optional" flags. The "optionalDependencies" feature
of "package.json" is used by @mkcert/node to install the correct binary
executable for your current platform.`,
    );
  }
}
