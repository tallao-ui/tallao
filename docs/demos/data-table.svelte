<!-- layout: wide -->
<script lang="ts">
  import { DataTable } from "tallao";

  const contacts = [
    { id: "1", name: "Ada Lovelace", team: "Research", score: 92 },
    { id: "2", name: "Grace Hopper", team: "Platform", score: 88 },
    { id: "3", name: "Alan Turing", team: "Research", score: 97 },
    { id: "4", name: "Margaret Hamilton", team: "Platform", score: 85 },
    { id: "5", name: "Linus Torvalds", team: "Infra", score: 79 },
    { id: "6", name: "Barbara Liskov", team: "Infra", score: 91 },
  ];

  let selected = $state<string[]>([]);
</script>

<DataTable
  rows={contacts}
  rowKey="id"
  caption="Team contacts"
  pageSize={4}
  selectable
  bind:selected
  columns={[
    { key: "name", header: "Name", sortable: true, filter: "text" },
    { key: "team", header: "Team", filter: "select" },
    { key: "score", header: "Points", sortable: true, align: "right" },
  ]}
/>
<p style="margin: 0.75rem 0 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  {selected.length} selected
</p>
