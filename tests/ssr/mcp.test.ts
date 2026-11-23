/**
 * The docs MCP server: the pure tools (scripts/mcp-core.mjs) and the stdio protocol
 * (scripts/mcp-server.mjs) over a real child process.
 */
import { spawn } from "node:child_process";

// @ts-expect-error a plain Node script, with no type declarations
import { callTool, loadData, tools } from "../../scripts/mcp-core.mjs";

type Result = { content: { type: string; text: string }[]; isError?: boolean };
const data = loadData();
const run = (name: string, args: Record<string, unknown> = {}) => callTool(name, args, data) as Result;
const out = (r: Result) => r.content[0].text;

describe("mcp tools", () => {
  it("declares the four tools with an input schema", () => {
    expect((tools as { name: string }[]).map((t) => t.name)).toEqual(["list_components", "search_components", "get_component", "get_setup"]);
    for (const t of tools as { inputSchema: { type: string } }[]) expect(t.inputSchema.type).toBe("object");
  });

  it("list_components groups by family and gives the total", () => {
    const text = out(run("list_components"));
    expect(text).toMatch(/^Button — .+ \(Actions and feedback\)$/m);
    expect(text).toContain(`Total: ${data.pages}`);
    const one = out(run("list_components", { family: "forms" }));
    expect(one).toContain("Input —");
    expect(one).not.toContain("Button —");
    expect(run("list_components", { family: "nope" }).isError).toBe(true);
  });

  it("search_components ranks and caps results", () => {
    const button = out(run("search_components", { query: "button" }));
    expect(button.split("\n")[0]).toMatch(/^Button \(button\) — /);
    expect(button.split("\n").length).toBeLessThanOrEqual(11);
    expect(out(run("search_components", { query: "tree" }))).toMatch(/^TreeView \(tree-view\)/m);
    expect(out(run("search_components", { query: "zzzqqq" }))).toContain("list_components");
  });

  it("get_component gives usage, props and accessibility", () => {
    const text = out(run("get_component", { name: "button" }));
    expect(text).toContain('import { Button } from "tallao"');
    expect(text).toContain("https://tallao-ui.github.io/tallao/docs/#/c/button");
    expect(text).toContain("src/lib/components/button.svelte");
    expect(text).toContain("## Usage");
    expect(text).not.toContain("<!-- layout:");
    expect(text).toContain("| Prop | Type | Default | Description |");
    expect(text).toContain("| variant? |");
    expect(text).toContain("## Behaviour and accessibility");
  });

  it("get_component resolves a part to its parent and rejects unknown names", () => {
    const text = out(run("get_component", { name: "CardHeader" }));
    expect(text).toMatch(/^# Card$/m);
    expect(text).toContain("CardHeader");
    const bad = run("get_component", { name: "Buton2" });
    expect(bad.isError).toBe(true);
    expect(out(bad)).toContain("Button");
  });

  it("get_setup comes from llms.txt", () => {
    const text = out(run("get_setup"));
    expect(text).toContain("pnpm add github:tallao-ui/tallao");
    expect(text).toContain("tallao/tokens.css");
    expect(text).toContain("tallao/base.css");
    expect(text).toContain("setLabels");
    expect(text).toContain("Motion");
    expect(text).toMatch(/never invent/i);
  });
});

describe("mcp server (stdio)", () => {
  it("speaks JSON-RPC and nothing else on stdout", async () => {
    const child = spawn(process.execPath, ["scripts/mcp-server.mjs"], { stdio: ["pipe", "pipe", "pipe"] });
    const lines: string[] = [];
    let buf = "";
    child.stdout.on("data", (d) => {
      buf += d;
      const parts = buf.split("\n");
      buf = parts.pop() ?? "";
      lines.push(...parts.filter(Boolean));
    });
    const send = (m: object | string) => child.stdin.write((typeof m === "string" ? m : JSON.stringify(m)) + "\n");
    try {
      send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } } });
      send({ jsonrpc: "2.0", method: "notifications/initialized" });
      send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
      send({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_component", arguments: { name: "Button" } } });
      send({ jsonrpc: "2.0", id: 4, method: "nope" });
      send("{not json");
      const deadline = Date.now() + 20_000;
      while (lines.length < 5 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 50));
      const msgs = lines.map((l) => JSON.parse(l)); // throws on any non-JSON noise
      expect(msgs).toHaveLength(5); // the notification got no reply
      const byId = (id: number) => msgs.find((m) => m.id === id);
      expect(byId(1).result.protocolVersion).toBe("2024-11-05");
      expect(byId(1).result.serverInfo.name).toBe("tallao-docs");
      expect(byId(1).result.capabilities).toEqual({ tools: {} });
      expect(byId(2).result.tools.map((t: { name: string }) => t.name)).toContain("get_setup");
      expect(byId(3).result.content[0].text).toContain("## Props");
      expect(byId(4).error.code).toBe(-32601);
      expect(msgs.find((m) => m.id === null).error.code).toBe(-32700);
      for (const m of msgs) expect(m.jsonrpc).toBe("2.0");
    } finally {
      child.kill();
    }
  }, 30_000);
});
