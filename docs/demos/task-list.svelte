<!-- layout: stack -->
<script lang="ts">
  import { TaskList, type TaskItem } from "tallao";

  const tasks: TaskItem[] = [
    { id: "t1", title: "Read the patch notes", status: "done", meta: "4 s" },
    { id: "t2", title: "Compare the meta across patches", status: "running", done: 5, total: 8, detail: "Pick rate, win rate and ban rate for 31 characters." },
    { id: "t3", title: "Publish the post", status: "pending", detail: "Waits for a human approval." },
    { id: "t4", title: "Notify the Discord channel", status: "failed", meta: "webhook 404" },
  ];
</script>

<TaskList {tasks} />
<TaskList variant="capsule" label="Tasks of this run" {tasks} />
