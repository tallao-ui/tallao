<!-- layout: stack -->
<script lang="ts">
  import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "tallao";
</script>

<Card>
  <CardHeader>
    <CardTitle>Nightly regression run</CardTitle>
  </CardHeader>
  <CardContent>
    <p style="margin: 0 0 0.5rem; color: rgb(var(--ta-text-dim))">
      184 of 187 checks passed in 6 min 12 s on branch <code>main</code>.
    </p>
    <Badge variant="warning">3 flaky</Badge>
  </CardContent>
  <CardFooter>
    <Button size="sm" variant="outline">View report</Button>
    <Button size="sm">Re-run</Button>
  </CardFooter>
</Card>
