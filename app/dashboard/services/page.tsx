import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/marketplace/empty-state";
import { ServiceCard } from "@/components/marketplace/service-card";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { services } from "@/lib/marketplace";

export const metadata = {
  title: "Dashboard Services",
};

export default async function DashboardServicesPage() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardShell
      title={t("dashboard.services.title")}
      description={t("dashboard.services.body")}
      locale={locale}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} locale={locale} />
        ))}
      </div>
      <div className="mt-6">
        <EmptyState
          title={t("dashboard.services.emptyTitle")}
          description={t("dashboard.services.emptyBody")}
        />
      </div>
    </DashboardShell>
  );
}
