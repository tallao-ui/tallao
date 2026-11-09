import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { Steps, SuggestionChips, CodeBlock, Sources, UsageMeter } from "$lib/components";

describe("Steps", () => {
  it("marks the running step with aria-current and the states by name", () => {
    render(Steps, {
      steps: [
        { title: "Review", status: "done" },
        { title: "Publish", status: "running" },
        { title: "Notify", status: "failed" },
      ],
    });
    const list = screen.getByRole("list", { name: "Plan steps" });
    expect(list).toBeTruthy();
    expect(screen.getByText("Publish").closest("li")!.getAttribute("aria-current")).toBe("step");
    expect(screen.getByText("Done")).toBeTruthy();
    expect(screen.getByText("Failed")).toBeTruthy();
  });
});

describe("SuggestionChips", () => {
  it("single use: calls onSelect and the chip goes away", async () => {
    const chosen: string[] = [];
    render(SuggestionChips, {
      suggestions: ["Write the report", "Publish to Cardback"],
      onSelect: (s: string) => chosen.push(s),
    });
    await userEvent.click(screen.getByRole("button", { name: "Write the report" }));
    await tick();
    expect(chosen).toEqual(["Write the report"]);
    expect(screen.queryByRole("button", { name: "Write the report" })).toBeNull();
    expect(screen.getByRole("button", { name: "Publish to Cardback" })).toBeTruthy();
  });

  it("with singleUse={false} the chip stays", async () => {
    render(SuggestionChips, { suggestions: ["Repeat"], onSelect: () => {}, singleUse: false });
    await userEvent.click(screen.getByRole("button", { name: "Repeat" }));
    await tick();
    expect(screen.getByRole("button", { name: "Repeat" })).toBeTruthy();
  });
});

describe("CodeBlock", () => {
  it("shows the code, the language and the copy button", () => {
    render(CodeBlock, { code: "const x = 1;", language: "ts", fileName: "app.ts" });
    expect(screen.getByText("const x = 1;")).toBeTruthy();
    expect(screen.getByText("app.ts")).toBeTruthy();
    expect(screen.getByText("ts")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
  });
});

describe("Sources", () => {
  it("lists the sources with a link and the domain taken from the URL", () => {
    render(Sources, {
      sources: [
        { url: "https://www.prydwen.gg/guide", title: "Guide" },
        { url: "https://game8.co/patch", title: "Patch" },
      ],
    });
    expect(screen.getByRole("list", { name: "Sources" })).toBeTruthy();
    const link = screen.getByRole("link", { name: /Guide/ }) as HTMLAnchorElement;
    expect(link.href).toBe("https://www.prydwen.gg/guide");
    expect(screen.getByText("prydwen.gg")).toBeTruthy();
  });
});

describe("UsageMeter", () => {
  it("shows the count and marks the level by threshold", () => {
    render(UsageMeter, { used: 9000, max: 10000 });
    expect(screen.getByText("9,000 / 10,000 tokens")).toBeTruthy();
    const bar = document.querySelector("meter")!;
    expect(bar.getAttribute("value")).toBe("9000");
    expect(document.querySelector(".ta-usage--warning")).toBeTruthy();
  });
});
