#!/usr/bin/env node

import { spawn } from "child_process";
import { generateBinPath } from "./platform";

const binPath = generateBinPath();
const child = spawn(binPath, process.argv.slice(2), { stdio: "inherit" });

process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGBREAK", () => child.kill("SIGBREAK"));
process.on("SIGHUP", () => child.kill("SIGHUP"));

child.on("exit", (code, signal) => {
  if (code !== null) {
    process.exit(code);
  } else {
    // If the code is null, it means the process was terminated by a signal
    // We need to check if the signal is SIGINT to exit with code 0
    // Otherwise, we exit with code 1
    process.exit(signal === "SIGINT" ? 0 : 1);
  }
});
