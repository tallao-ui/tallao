<!-- layout: stack; height: 26 -->
<script lang="ts">
  import { Button, EventFeed, type FeedEvent } from "tallao";

  const run: Omit<FeedEvent, "id" | "time">[] = [
    { title: "Run started", detail: "Publish the patch 1.2 notes" },
    { title: "Read post #42", detail: "Patch 1.2 notes, draft", tone: "info" },
    { title: "Searched the style guide", detail: "3 matches for “summary”", icon: "search" },
    { title: "Wrote the summary", detail: "118 words", tone: "accent" },
    { title: "Approval requested", detail: "Publish on the home page", tone: "warning" },
    { title: "Published", detail: "Live for every visitor", tone: "success" },
  ];

  let count = 1;
  const at = (i: number) => `12:${String(i).padStart(2, "0")}`;
  let events = $state<FeedEvent[]>([{ id: 0, ...run[0], time: at(0) }]);

  function next() {
    events = [{ id: count, ...run[count % run.length], time: at(count) }, ...events];
    count++;
  }
  function reset() {
    count = 1;
    events = [{ id: 0, ...run[0], time: at(0) }];
  }
</script>

<div style="display: flex; gap: 0.5rem">
  <Button size="sm" onclick={next}>Next event</Button>
  <Button size="sm" variant="ghost" onclick={reset}>Reset</Button>
</div>
<EventFeed {events} limit={5} ariaLabel="Agent activity" />
