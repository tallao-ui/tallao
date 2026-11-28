import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import FlowNodes from "../fixtures/FlowNodes.svelte";

describe("FlowNode", () => {
  it("the body is one button that says it is picked; actions sit beside it", async () => {
    render(FlowNodes);
    const body = screen.getByRole("button", { name: /^Give coins/ });
    expect(body.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(body);
    expect(screen.getByTestId("picked").textContent).toBe("1");
    expect(body.getAttribute("aria-pressed")).toBe("true");
    expect(body.closest(".ta-flow-node")?.hasAttribute("data-selected")).toBe(true);

    const remove = screen.getByRole("button", { name: "Remove Reply" });
    expect(remove.closest(".ta-flow-node-body")).toBeNull();
    await userEvent.click(remove);
    expect(screen.getByTestId("removed").textContent).toBe("Reply");
    expect(screen.getByTestId("picked").textContent).toBe("1");
  });

  it("each run state shows its word; pending shows none; running is the current step", () => {
    render(FlowNodes, { props: { statuses: ["done", "running", "pending"] } });
    const [cooldown, coins, reply] = screen.getAllByRole("listitem").map((li) => li.querySelector(".ta-flow-node") as HTMLElement);
    expect(cooldown.querySelector(".ta-flow-node-status")?.textContent).toBe("Done");
    expect(coins.querySelector(".ta-flow-node-status")?.textContent).toBe("Running…");
    expect(coins.getAttribute("aria-current")).toBe("step");
    expect(reply.querySelector(".ta-flow-node-status")).toBeNull();
    expect(cooldown.getAttribute("aria-current")).toBeNull();
  });

  it("skipped, failed and stopped have their own words, and statusLabel wins", () => {
    render(FlowNodes, { props: { statuses: ["skipped", "failed", "stopped"] } });
    const words = [...document.querySelectorAll("ol .ta-flow-node-status")].map((n) => n.textContent);
    expect(words).toEqual(["Skipped", "Failed", "Stopped"]);
    expect(screen.getByTestId("block").querySelector(".ta-flow-node-status")?.textContent).toBe("Stopped here");
  });

  it("without onclick the body is a plain block", () => {
    render(FlowNodes);
    const block = screen.getByTestId("block");
    expect(block.querySelector("button")).toBeNull();
    expect(block.querySelector(".ta-flow-node-label")?.textContent).toBe("Read only");
  });

  it("the number and the icon are decorative; the colour reaches the icon", () => {
    render(FlowNodes);
    const node = screen.getAllByRole("listitem")[0].querySelector(".ta-flow-node") as HTMLElement;
    expect(node.querySelector(".ta-flow-node-index")?.getAttribute("aria-hidden")).toBe("true");
    expect(node.querySelector(".ta-flow-node-icon")?.getAttribute("aria-hidden")).toBe("true");
    expect(node.style.getPropertyValue("--ta-flow-node-tone")).toBe("rgb(var(--ta-series-3))");
  });

  it("has no axe violations", async () => {
    const { container } = render(FlowNodes, { props: { statuses: ["done", "running", "skipped"] } });
    expect(await axeViolations(container)).toEqual([]);
  });
});
