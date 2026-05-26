import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/marketplace/empty-state";
import { SubmissionForm } from "@/components/marketplace/submission-form";

export const metadata = {
  title: "Dashboard Submissions",
};

export default function DashboardSubmissionsPage() {
  return (
    <DashboardShell
      title="Submissions"
      description="Review submitted work, proof links, notes, approval state, and reputation outcomes."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <EmptyState
          title="No live submissions yet"
          description="Submitted work will appear here after task_submissions is connected to active deals."
        />
        <SubmissionForm />
      </div>
    </DashboardShell>
  );
}
