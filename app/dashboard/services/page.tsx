import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/marketplace/empty-state";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

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
      <EmptyState
        title={t("dashboard.services.emptyTitle")}
        description={t("dashboard.services.emptyBody")}
      />
    </DashboardShell>
  );
}
