<!-- layout: stack -->
<script lang="ts">
  import { RecommendationCard } from "tallao";

  let dismissed = $state(false);
  let sent = $state(false);
</script>

{#if !dismissed}
  <RecommendationCard
    title="Send the Discord announcement now"
    description="The draft is ready and the patch notes are live."
    reasons={["Announcements within an hour of a patch get twice the clicks", "The #news channel has had no post in 6 days"]}
    confidence="medium"
    actionLabel={sent ? "Sent" : "Review the draft"}
    onAction={async () => {
      await new Promise((r) => setTimeout(r, 700));
      sent = true;
    }}
    secondaryLabel="Not now"
    onSecondary={() => (dismissed = true)}
    onDismiss={() => (dismissed = true)}
  />
{:else}
  <button type="button" onclick={() => ((dismissed = false), (sent = false))}>Bring it back</button>
{/if}
