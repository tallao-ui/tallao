import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import Carousels from "../fixtures/Carousels.svelte";

const state = () => JSON.parse(screen.getByTestId("state").textContent!);

// jsdom neither scrolls nor measures: the track gets hand-set measurements and scrollBy/scrollTo are spied on.
const scrollBy = vi.fn();
const scrollTo = vi.fn();
beforeEach(() => {
  scrollBy.mockClear();
  scrollTo.mockClear();
  HTMLElement.prototype.scrollBy = scrollBy as unknown as HTMLElement["scrollBy"];
  HTMLElement.prototype.scrollTo = scrollTo as unknown as HTMLElement["scrollTo"];
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const track = () => document.querySelector<HTMLElement>(".ta-carousel-track")!;

async function measure(left: number, width = 1000, visible = 300) {
  const t = track();
  Object.defineProperty(t, "scrollWidth", { configurable: true, value: width });
  Object.defineProperty(t, "clientWidth", { configurable: true, value: visible });
  Object.defineProperty(t, "scrollLeft", { configurable: true, writable: true, value: left });
  await fireEvent.scroll(t);
}

describe("Carousel", () => {
  it('is a named carousel region whose slides are groups read as "n of m"', () => {
    render(Carousels);
    const region = screen.getByRole("region", { name: "Games" });
    expect(region.getAttribute("aria-roledescription")).toBe("carousel");
    const slides = screen.getAllByRole("group");
    expect(slides.map((d) => d.getAttribute("aria-label"))).toEqual(["1 of 3", "2 of 3", "3 of 3"]);
    expect(slides.every((d) => d.getAttribute("aria-roledescription") === "slide")).toBe(true);
    expect(screen.getByRole("link", { name: "2. Diablo IV" })).toBeTruthy();
    // Without autoplay there is no rotation button.
    expect(screen.queryByRole("button", { name: "Stop slide rotation" })).toBeNull();
  });

  it("disables Previous and Next at the ends, and moves the focus off the button it disables", async () => {
    render(Carousels);
    const previous = screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement;
    const next = screen.getByRole("button", { name: "Next" }) as HTMLButtonElement;
    await measure(0);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    await measure(350);
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(false);
    next.focus();
    await measure(700);
    expect(next.disabled).toBe(true);
    expect(document.activeElement).toBe(previous);
  });

  it("scrolls one slide with the buttons and the arrow keys, and to the ends with Home and End", async () => {
    render(Carousels);
    await measure(350);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 300 }));
    await userEvent.keyboard("{ArrowLeft}");
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -300 }));
    await userEvent.keyboard("{ArrowRight}");
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 300 }));
    await userEvent.keyboard("{End}");
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 1000 }));
    await userEvent.keyboard("{Home}");
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }));
  });

  it("autoplay advances on its interval, pauses on hover and with its button, and wraps at the end", async () => {
    vi.useFakeTimers();
    render(Carousels, { props: { autoplay: true } });
    await measure(0);
    vi.advanceTimersByTime(1000);
    expect(scrollBy).toHaveBeenCalledTimes(1);

    const region = screen.getByRole("region", { name: "Games" });
    await fireEvent.pointerEnter(region);
    vi.advanceTimersByTime(3000);
    expect(scrollBy).toHaveBeenCalledTimes(1);
    await fireEvent.pointerLeave(region);
    vi.advanceTimersByTime(1000);
    expect(scrollBy).toHaveBeenCalledTimes(2);

    await measure(700);
    vi.advanceTimersByTime(1000);
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }));

    await fireEvent.click(screen.getByRole("button", { name: "Stop slide rotation" }));
    expect(screen.getByRole("button", { name: "Start slide rotation" })).toBeTruthy();
    vi.advanceTimersByTime(5000);
    expect(scrollBy).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("autoplay pauses while the focus is inside", async () => {
    vi.useFakeTimers();
    render(Carousels, { props: { autoplay: true } });
    await measure(0);
    screen.getByRole("link", { name: "1. Aniimo" }).focus();
    await tick();
    vi.advanceTimersByTime(3000);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("autoplay never starts when reduced motion is asked for", async () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("reduce"),
      media: q,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.useFakeTimers();
    render(Carousels, { props: { autoplay: true } });
    await measure(0);
    vi.advanceTimersByTime(5000);
    expect(scrollBy).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Stop slide rotation" })).toBeNull();
  });

  it("shows its empty snippet without items", () => {
    render(Carousels, { props: { noItems: true } });
    expect(screen.getByText("No games.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});

describe("CompareSlider", () => {
  it("is a named slider moved by the arrows (step 2), Page keys, Home and End", async () => {
    render(Carousels);
    const s = screen.getByRole("slider", { name: "Compare the map" });
    expect(s.getAttribute("aria-valuenow")).toBe("50");
    expect(s.getAttribute("aria-valuemin")).toBe("0");
    expect(s.getAttribute("aria-valuemax")).toBe("100");
    expect(s.getAttribute("aria-valuetext")).toBe("50 % before");
    s.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(state().position).toBe(52);
    expect(s.getAttribute("aria-valuenow")).toBe("52");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(state().position).toBe(48);
    await userEvent.keyboard("{End}");
    expect(state().position).toBe(100);
    await userEvent.keyboard("{PageDown}");
    expect(state().position).toBe(90);
    await userEvent.keyboard("{Home}");
    expect(state()).toEqual({ position: 0, released: 0 });
  });

  it("drags with the pointer captured on the box, and a cancelled pointer ends the drag", async () => {
    render(Carousels);
    const s = screen.getByRole("slider", { name: "Compare the map" });
    s.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} });
    const capture = vi.fn();
    s.setPointerCapture = capture;
    s.hasPointerCapture = () => false;
    // jsdom has no PointerEvent: a MouseEvent with that name is enough.
    const pointer = (type: string, clientX: number) => fireEvent(s, new MouseEvent(type, { bubbles: true, button: 0, clientX }));

    await pointer("pointerdown", 50);
    expect(capture).toHaveBeenCalled();
    expect(state().position).toBe(25);
    await pointer("pointermove", 120);
    expect(state().position).toBe(60);

    // The images are not draggable: a native drag used to kill the capture.
    const images = s.querySelectorAll("img");
    expect([...images].every((i) => i.getAttribute("draggable") === "false")).toBe(true);
    const drag = new Event("dragstart", { bubbles: true, cancelable: true });
    images[0].dispatchEvent(drag);
    expect(drag.defaultPrevented).toBe(true);

    await pointer("pointercancel", 120);
    expect(state().released).toBe(60);
    await pointer("pointermove", 180);
    expect(state().position).toBe(60);
  });
});

describe("axe on Carousel and CompareSlider", () => {
  it("finds no violations", async () => {
    const { container } = render(Carousels, { props: { autoplay: true } });
    expect(await axeViolations(container)).toEqual([]);
  });
});
