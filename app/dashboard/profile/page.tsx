import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreatorCard } from "@/components/marketplace/creator-card";
import { EmptyState } from "@/components/marketplace/empty-state";
import { creators } from "@/lib/marketplace";

export const metadata = {
  title: "Dashboard Profile",
};

export default function DashboardProfilePage() {
  return (
    <DashboardShell
      title="Operator profile"
      description="Profile setup placeholder for public reputation, specialties, services, and completed work history."
    >
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <CreatorCard creator={creators[0]} />
        <EmptyState
          title="Editable profile form coming later"
          description="This page will connect profiles, services, proof links, and reputation events after auth is introduced."
        />
      </div>
    </DashboardShell>
  );
}
