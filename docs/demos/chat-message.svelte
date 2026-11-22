<!-- layout: stack -->
<script lang="ts">
  import { ChatMessage } from "tallao";
</script>

<ChatMessage role="user" author="Ana" content="Which characters lost the most pick rate since patch 1.1?" />
<ChatMessage content={"Kaela fell from 18.4% to 11.2% after her dash reset was removed.\nOskar moved up two tiers."}>
  {#snippet footer()}
    <span style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">Used 2 tools · 18:40</span>
  {/snippet}
</ChatMessage>
<ChatMessage role="system" content="The conversation was moved to the Valhalla workspace." />
<ChatMessage pending />
