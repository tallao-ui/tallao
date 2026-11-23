<!-- layout: wide -->
<script lang="ts">
  import { Beam, Icon } from "tallao";

  let box = $state<HTMLElement>();
  let agent = $state<HTMLElement>();
  let search = $state<HTMLElement>();
  let orders = $state<HTMLElement>();
  let mail = $state<HTMLElement>();
</script>

<div bind:this={box} class="flow">
  <div bind:this={agent} class="node node--agent"><Icon name="bot" size={20} /> Support agent</div>
  <div class="tools">
    <div bind:this={search} class="node"><Icon name="search" /> Search the help center</div>
    <div bind:this={orders} class="node"><Icon name="database" /> Orders database</div>
    <div bind:this={mail} class="node"><Icon name="file" /> Draft an email</div>
  </div>
  <Beam container={box} from={agent} to={search} curvature={60} />
  <Beam container={box} from={agent} to={orders} delay={0.8} />
  <!-- The answer comes back on the same line. -->
  <Beam container={box} from={agent} to={orders} reverse delay={2.2} tone="success" />
  <Beam container={box} from={agent} to={mail} curvature={-60} delay={1.5} tone="accent-2" />
</div>

<style>
  .flow {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4rem;
    min-height: 15rem;
    padding: 1rem clamp(0.5rem, 3vw, 2.5rem);
  }
  .tools {
    display: grid;
    gap: 1.75rem;
  }
  .node {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.85rem;
    font-size: 0.875rem;
    font-weight: 500;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
  }
  .node--agent {
    padding: 0.85rem 1.1rem;
    border-color: rgb(var(--ta-accent) / 0.6);
    box-shadow: 0 0 0 4px rgb(var(--ta-accent) / 0.12);
  }
</style>
