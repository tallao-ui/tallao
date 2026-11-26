#!/usr/bin/env node
// The `tallao` command: `npx tallao mcp` starts the docs MCP server over stdio.
import { readFileSync } from "node:fs";

const [cmd] = process.argv.slice(2);
const version = () => JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const help = `tallao ${version()}: Svelte 5 UI kit for generative interfaces

Usage:
  tallao mcp         start the docs MCP server on stdio (list_components, search_components,
                     get_component, get_setup)
  tallao --version   print the version
  tallao --help      print this help

MCP client settings:
  { "mcpServers": { "tallao": { "command": "npx", "args": ["-y", "tallao", "mcp"] } } }
`;

if (cmd === "mcp") {
  await import("../scripts/mcp-server.mjs");
} else if (cmd === "--version" || cmd === "-v") {
  process.stdout.write(version() + "\n");
} else if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
  process.stdout.write(help);
} else {
  process.stderr.write(`tallao: unknown command "${cmd}"\n\n${help}`);
  process.exit(1);
}
