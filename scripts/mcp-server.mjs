#!/usr/bin/env node
// stdio MCP server for the tallao docs: JSON-RPC 2.0, one JSON message per line, no dependencies.
// stdout carries only JSON-RPC; logs go to stderr. Tools live in scripts/mcp-core.mjs.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { callTool, loadData, tools } from "./mcp-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERSIONS = ["2024-11-05", "2025-03-26", "2025-06-18"];
const log = (...a) => console.error("[tallao-docs]", ...a);

if (!fs.existsSync(path.join(ROOT, "docs", "gen", "components.json"))) {
  log("docs/gen/components.json missing, running scripts/docs-data.mjs");
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "docs-data.mjs")], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0) {
    log("could not generate docs data");
    process.exit(1);
  }
}
const data = loadData(ROOT);
const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;

const send = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...msg }) + "\n");
const fail = (id, code, message) => send({ id, error: { code, message } });

function handle(msg) {
  if (!msg || typeof msg !== "object" || Array.isArray(msg) || typeof msg.method !== "string") {
    return fail(msg && msg.id !== undefined ? msg.id : null, -32600, "Invalid Request");
  }
  const { id, method, params } = msg;
  if (id === undefined || id === null) return; // notifications get no reply
  switch (method) {
    case "initialize": {
      const v = params?.protocolVersion;
      return send({
        id,
        result: {
          protocolVersion: VERSIONS.includes(v) ? v : "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "tallao-docs", version },
        },
      });
    }
    case "ping":
      return send({ id, result: {} });
    case "tools/list":
      return send({ id, result: { tools } });
    case "tools/call":
      if (!params || typeof params.name !== "string") return fail(id, -32602, "Invalid params: name is required");
      return send({ id, result: callTool(params.name, params.arguments, data, ROOT) });
    default:
      return fail(id, -32601, `Method not found: ${method}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return fail(null, -32700, "Parse error");
  }
  try {
    handle(msg);
  } catch (e) {
    log(e);
    fail(msg?.id ?? null, -32603, "Internal error");
  }
});
rl.on("close", () => process.exit(0));
