import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import CodeEditor from "$lib/code/code-editor.svelte";
import { axeViolations } from "../axe";
import Panels from "../fixtures/Panels.svelte";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Breadcrumb", () => {
  it("is a named nav with an ordered list; the last item is the current page", () => {
    render(Panels);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Kons" }).getAttribute("href")).toBe("/kons");
    expect(within(nav).getByText("Agile").getAttribute("aria-current")).toBe("page");
  });
});

describe("Icon", () => {
  it("is decorative without a label and an image with one", () => {
    const { container } = render(Panels);
    expect(screen.getByRole("img", { name: "Agent" }).tagName.toLowerCase()).toBe("svg");
    expect(container.querySelectorAll("svg[aria-hidden=true]").length).toBeGreaterThan(0);
  });
});

describe("SplitPane", () => {
  it("is a named separator that moves with the arrows, Home, End and Enter", async () => {
    render(Panels);
    const sep = screen.getByRole("separator", { name: "List width" });
    expect(sep.getAttribute("aria-valuenow")).toBe("40");
    sep.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByTestId("width").textContent).toBe("45");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(sep.getAttribute("aria-valuenow")).toBe("35");
    await userEvent.keyboard("{End}");
    expect(sep.getAttribute("aria-valuenow")).toBe("85");
    await userEvent.keyboard("{Home}");
    expect(sep.getAttribute("aria-valuenow")).toBe("15");
    await userEvent.keyboard("{Enter}");
    expect(sep.getAttribute("aria-valuenow")).not.toBe("15");
    expect(document.getElementById(sep.getAttribute("aria-controls")!)?.textContent).toContain("List");
  });
});

describe("Sidebar", () => {
  it("marks the current page and opens its branch; the others stay closed", () => {
    render(Panels);
    const nav = screen.getByRole("navigation", { name: "Navigation" });
    expect(within(nav).getByRole("link", { name: "Agile" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("button", { name: "Kons" }).getAttribute("aria-expanded")).toBe("true");
    expect(within(nav).getByRole("button", { name: "Settings" }).getAttribute("aria-expanded")).toBe("false");
    expect(within(nav).queryByRole("link", { name: "Account" })).toBeNull();
  });

  it("opens a branch with its disclosure button and collapses the bar", async () => {
    render(Panels);
    const nav = screen.getByRole("navigation", { name: "Navigation" });
    await userEvent.click(within(nav).getByRole("button", { name: "Settings" }));
    expect(within(nav).getByRole("link", { name: "Account" })).toBeTruthy();
    await userEvent.click(within(nav).getByRole("button", { name: "Collapse" }));
    expect(screen.getByTestId("collapsed").textContent).toBe("true");
    // Collapsed, every link keeps its name.
    expect(within(nav).getByRole("link", { name: "Home" })).toBeTruthy();
    expect(within(nav).getByRole("button", { name: "Expand" }).getAttribute("aria-expanded")).toBe("false");
  });
});

describe("BarChart and LineChart", () => {
  it("are sliders over the categories that read each one out", async () => {
    render(Panels);
    const bars = screen.getByRole("slider", { name: "Visits per month" });
    bars.focus();
    await tick();
    expect(bars.getAttribute("aria-valuetext")).toBe("Jan: Visits 120, Signups 30");
    await userEvent.keyboard("{ArrowRight}");
    expect(bars.getAttribute("aria-valuetext")).toBe("Feb: Visits 180, Signups 45");
    await userEvent.keyboard("{End}");
    expect(bars.getAttribute("aria-valuetext")).toBe("Mar: Visits 150, Signups —");
    await userEvent.keyboard("{Escape}");
    expect(bars.getAttribute("aria-valuetext")).toBe("Visits per month");

    const line = screen.getByRole("slider", { name: "Trend" });
    line.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(line.getAttribute("aria-valuetext")).toContain("Visits");
  });

  it("have a legend for two or more series only, and a table view", async () => {
    render(Panels);
    const [barFigure, lineFigure] = screen.getAllByRole("figure");
    expect(within(barFigure).getByRole("list").textContent).toContain("Signups");
    expect(within(lineFigure).queryByRole("list")).toBeNull();
    const button = within(barFigure).getByRole("button", { name: "Show data" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const table = within(barFigure).getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    expect(table.textContent).toContain("180");
  });
});

describe("SchemaForm", () => {
  it("builds the fields from the schema, with labels and defaults", () => {
    render(Panels);
    expect((screen.getByLabelText(/Title/) as HTMLInputElement).value).toBe("Hello");
    expect((screen.getByLabelText(/Email/) as HTMLInputElement).type).toBe("email");
    expect(screen.getByLabelText(/Status/).tagName).toBe("SELECT");
    expect((screen.getByLabelText(/Level/) as HTMLInputElement).type).toBe("number");
    expect(screen.getByRole("switch", { name: "Active" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Author" })).toBeTruthy();
    expect(screen.getByText("What shows at the top")).toBeTruthy();
  });

  it("does not submit while invalid: shows the errors and focuses the first one", async () => {
    const onSubmit = vi.fn();
    render(Panels, { onSubmit });
    const title = screen.getByLabelText(/Title/) as HTMLInputElement;
    await userEvent.clear(title);
    await userEvent.type(title, "ab");
    await userEvent.type(screen.getByLabelText(/Email/), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(title);
    expect(title.getAttribute("aria-invalid")).toBe("true");
    const alerts = screen.getAllByRole("alert").map((a) => a.textContent);
    expect(alerts).toEqual(expect.arrayContaining([expect.stringContaining("Invalid"), "Required"]));
  });

  it("does not paint the error on blur when focus goes to submit (the button would move under the click)", async () => {
    render(Panels);
    const title = screen.getByLabelText(/Title/) as HTMLInputElement;
    await userEvent.clear(title);
    await userEvent.type(title, "ab");
    await fireEvent.blur(title, { relatedTarget: screen.getByRole("button", { name: "Save" }) });
    expect(title.getAttribute("aria-invalid")).toBeNull();
    await fireEvent.blur(title, { relatedTarget: null });
    expect(title.getAttribute("aria-invalid")).toBe("true");
  });

  it("submits the typed value once it is valid", async () => {
    const onSubmit = vi.fn();
    render(Panels, { onSubmit });
    await userEvent.type(screen.getByLabelText(/Title/), " world");
    await userEvent.selectOptions(screen.getByLabelText(/Status/), "live");
    await userEvent.type(screen.getByLabelText(/Level/), "3");
    await userEvent.click(screen.getByRole("switch", { name: "Active" }));
    await userEvent.type(screen.getByLabelText(/Author name/), "Ana");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toEqual({
      title: "Hello world",
      email: "",
      status: "live",
      level: 3,
      active: true,
      author: { name: "Ana" },
    });
  });

  it("checks numbers against minimum and maximum, and the pattern", async () => {
    const onSubmit = vi.fn();
    render(Panels, { onSubmit });
    await userEvent.selectOptions(screen.getByLabelText(/Status/), "draft");
    await userEvent.type(screen.getByLabelText(/Level/), "11");
    await userEvent.type(screen.getByLabelText(/Author name/), "R2-D2");
    await fireEvent.submit(screen.getByRole("button", { name: "Save" }).closest("form")!);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Level/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText(/Author name/).getAttribute("aria-invalid")).toBe("true");
  });

  it("names the fields with dotted paths for a native form", () => {
    const { container } = render(Panels, { name: "post" });
    const names = [...container.querySelectorAll("form [name]")].map((e) => e.getAttribute("name"));
    expect(names).toEqual(expect.arrayContaining(["post.title", "post.status", "post.level", "post.author.name"]));
  });
});

describe("CodeEditor", () => {
  it("starts as a named textarea and turns into CodeMirror, keeping the value in the form", async () => {
    const { container } = render(CodeEditor, { value: "# Hello", language: "markdown", name: "body" });
    const fallback = container.querySelector("textarea")!;
    expect(fallback.name).toBe("body");
    expect(fallback.value).toBe("# Hello");
    for (let i = 0; i < 100 && !container.querySelector(".cm-content"); i++) await wait(20);
    const editor = container.querySelector(".cm-content")!;
    expect(editor).toBeTruthy();
    expect(editor.getAttribute("aria-label")).toBe("Code editor");
    expect(editor.textContent).toContain("# Hello");
    expect(fallback.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("axe on the 0.7 components", () => {
  it("finds no violations, with a chart table open", async () => {
    const { container } = render(Panels);
    await userEvent.click(screen.getAllByRole("button", { name: "Show data" })[0]);
    expect(await axeViolations(container)).toEqual([]);
  });
});
