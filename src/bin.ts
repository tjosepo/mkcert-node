#!/usr/bin/env node
import { MKCERT_BINARY_PATH } from "./platform";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

spawnSync(MKCERT_BINARY_PATH, args, { stdio: "inherit", cwd: process.cwd() });