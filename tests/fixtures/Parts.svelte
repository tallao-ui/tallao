<!-- Compact Table with a sticky column, solid Badge, Spinner, danger-ghost Button and MonthView;
     the tests read the state. -->
<script lang="ts">
  import {
    Badge,
    Button,
    MonthView,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components";

  interface Props {
    month?: string;
    showOutsideDays?: boolean;
  }
  const { month: initial = "2026-11-01", showOutsideDays = true }: Props = $props();

  const types = ["Fire", "Water", "Grass"];
  let chosen = $state(0);
  // svelte-ignore state_referenced_locally
  let currentMonth = $state(initial);
  let changes = $state<string[]>([]);
  let event = $state<string | null>(null);
  const events = [
    { id: "a", date: "2026-11-14", title: "Regional tournament" },
    { id: "b", date: "2026-11-14", title: "Livestream" },
    { id: "c", date: "2026-12-02", title: "Patch" },
  ];
</script>

<Table density="compact" stickyFirstColumn aria-label="Type chart" data-testid="matrix">
  <TableHeader>
    <TableRow>
      <TableHead>Attacks ↓</TableHead>
      {#each types as t (t)}<TableHead style="text-align: center" title={`Defender: ${t}`}>{t}</TableHead>{/each}
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each types as a, i (a)}
      <TableRow>
        <TableHead scope="row">
          <Button variant="ghost" size="sm" aria-pressed={i === chosen} onclick={() => (chosen = i)}>{a}</Button>
        </TableHead>
        {#each types as d (d)}
          <TableCell style="text-align: center" title={`${a} → ${d}`} aria-describedby="legend">×1</TableCell>
        {/each}
      </TableRow>
    {/each}
  </TableBody>
</Table>
<p id="legend">Damage multiplier</p>

<Table><TableBody><TableRow><TableCell>Normal</TableCell></TableRow></TableBody></Table>

<Badge variant="accent-2">New</Badge>
<Badge variant="error" tone="solid" title="Broadcast in progress" data-testid="live">LIVE</Badge>
<Badge variant="default" tone="solid">Neutral</Badge>

<Spinner />
<Spinner size="lg" label="Loading the month" />
<Spinner size={40} label="Loading at a custom size" />

<Button variant="danger-ghost">Delete</Button>

<MonthView
  bind:month={currentMonth}
  locale="es-ES"
  headingLevel={3}
  {showOutsideDays}
  data-testid="month"
  onmonthchange={(m) => (changes = [...changes, m])}
>
  {#snippet day(d)}
    <span class="info" data-iso={d.date} data-outside={d.outside} data-today={d.today}></span>
    {#each events.filter((e) => e.date === d.date) as e (e.id)}
      <button type="button" onclick={() => (event = e.title)}>{e.title}</button>
    {/each}
  {/snippet}
</MonthView>

<span data-testid="state">{JSON.stringify({ chosen, currentMonth, changes, event })}</span>
