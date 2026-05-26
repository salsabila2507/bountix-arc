import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/marketplace/empty-state";
import { ServiceCard } from "@/components/marketplace/service-card";
import { services } from "@/lib/marketplace";

export const metadata = {
  title: "Dashboard Services",
};

export default function DashboardServicesPage() {
  return (
    <DashboardShell
      title="Service offers"
      description="Manage creator service listings, incoming inquiries, and packaged execution offers."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      <div className="mt-6">
        <EmptyState
          title="Inquiry routing placeholder"
          description="Service inquiries will later create service_inquiries records and can convert into deals after negotiation."
        />
      </div>
    </DashboardShell>
  );
}
