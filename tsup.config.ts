import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts", "src/index.ts", "src/postinstall.ts"],
  format: ["cjs", "esm"],
  outDir: "packages/mkcert/dist",
  clean: true,
  shims: true,
  dts: true,
})