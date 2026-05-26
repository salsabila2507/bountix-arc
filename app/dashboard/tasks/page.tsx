import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/marketplace/empty-state";
import { TaskCard } from "@/components/marketplace/task-card";
import { tasks } from "@/lib/marketplace";

export const metadata = {
  title: "Dashboard Tasks",
};

export default function DashboardTasksPage() {
  return (
    <DashboardShell
      title="Task operations"
      description="Track posted tasks, applicants, submissions, negotiation status, and payment mode."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <div className="mt-6">
        <EmptyState
          title="Application queue coming next"
          description="Applicant review, approval, rejection, and negotiation actions will connect to task_applications in the backend pass."
        />
      </div>
    </DashboardShell>
  );
}
