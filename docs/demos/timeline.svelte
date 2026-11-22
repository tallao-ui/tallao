<!-- layout: stack -->
<script lang="ts">
  import { Timeline } from "tallao";
</script>

<Timeline
  ariaLabel="Release history"
  locale="en"
  items={[
    { date: "2026-09-02", title: "v2.0 released", description: "New billing engine and usage-based plans.", tag: "Release", tone: "success" },
    { date: "2026-09-19", title: "Checkout outage", description: "Payments failed for 14 minutes; rolled back.", tag: "Incident", tone: "error" },
    { date: "2026-10-11", title: "SOC 2 audit started", tag: "Compliance", tone: "warning" },
    { date: "2026-11-20", title: "v2.1 in beta", description: "Dashboards and CSV exports.", tag: "Beta", tone: "accent", current: true },
    { date: "Q1 2027", title: "Public API v3" },
  ]}
/>
