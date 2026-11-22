<!-- layout: stack -->
<script lang="ts">
  import { CodeBlock } from "tallao";

  const code = `export async function publishPost(id: number) {
  const post = await db.posts.get(id);
  if (post.status !== "review") throw new Error("Not in review");
  await db.posts.update(id, { status: "published", publishedAt: new Date() });
  return post.slug;
}`;
</script>

<CodeBlock {code} language="ts" fileName="publish-post.ts" />
<CodeBlock code={"SELECT character, pick_rate\nFROM meta_stats\nWHERE patch = '1.2'\nORDER BY pick_rate DESC\nLIMIT 5;"} language="sql" />
