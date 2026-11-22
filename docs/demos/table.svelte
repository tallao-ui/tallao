<!-- layout: wide -->
<script lang="ts">
  import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "tallao";

  const runs = [
    { id: "run_4821", agent: "Triage bot", tokens: 18420, status: "Done" },
    { id: "run_4822", agent: "Docs writer", tokens: 52310, status: "Running" },
    { id: "run_4823", agent: "Release notes", tokens: 9875, status: "Failed" },
  ];
</script>

<Table aria-label="Recent agent runs">
  <TableHeader>
    <TableRow>
      <TableHead>Run</TableHead>
      <TableHead>Agent</TableHead>
      <TableHead>Tokens</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each runs as run (run.id)}
      <TableRow>
        <TableCell>{run.id}</TableCell>
        <TableCell>{run.agent}</TableCell>
        <TableCell>{run.tokens.toLocaleString("en")}</TableCell>
        <TableCell><Badge>{run.status}</Badge></TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>
