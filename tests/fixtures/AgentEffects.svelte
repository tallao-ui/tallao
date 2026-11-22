<!-- Beam between two boxes, a Terminal and an EventFeed, with the props the tests change. -->
<script lang="ts">
  import { Beam, EventFeed, Terminal, type FeedEvent, type TerminalLine } from "$lib/components";

  let {
    curvature = 0,
    active = true,
    reverse = false,
    lines = [] as TerminalLine[],
    autoplay = true,
    onDone = undefined as (() => void) | undefined,
    feed = [] as FeedEvent[],
    limit = undefined as number | undefined,
    announce = false,
    emptyText = undefined as string | undefined,
  } = $props();

  let box = $state<HTMLElement>();
  let agent = $state<HTMLElement>();
  let tool = $state<HTMLElement>();
</script>

<div bind:this={box} data-testid="box" style="position: relative">
  <div bind:this={agent} data-testid="agent">Agent</div>
  <div bind:this={tool} data-testid="tool">Search</div>
  <Beam container={box} from={agent} to={tool} {curvature} {active} {reverse} data-testid="beam" />
</div>

{#if lines.length}
  <Terminal {lines} {autoplay} {onDone} speed={10} lineDelay={50} title="agent · ~/app" />
{/if}

<EventFeed events={feed} {limit} {announce} {emptyText} />
