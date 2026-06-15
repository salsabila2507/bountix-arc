import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostServiceForm } from "@/components/marketplace/post-service-form";
import { SiteHeader } from "@/components/site-header";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getServerNetworkSlug } from "@/lib/network-store";
import { getNetworkConfig } from "@/lib/networks";
import { getAuthCtx } from "@/lib/auth/db-ctx";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post Service",
  description:
    "Create a Bountix creator service offer with manual payment or escrow.",
};

async function loadActor() {
  try {
    const ctx = await getAuthCtx();
    if (!ctx) return { userId: null, profile: null as null };
    const { supabase, userId } = ctx;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", userId)
      .maybeSingle();

    return { userId, profile };
  } catch {
    return { userId: null, profile: null as null };
  }
}

export default async function PostServicePage() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  const networkSlug = await getServerNetworkSlug();
  const networkName = getNetworkConfig(networkSlug).name;
  const { userId, profile } = await loadActor();

  if (!userId) {
    redirect("/login");
  }

  if (!profile) {
    return (
      <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
        <SiteHeader />
        <section className="container-page py-10">
          <p className="text-base font-semibold text-[#5a3b66]">
            {t("postTask.profileMissing")}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t("service.backToMyServices")}
        </Link>

        <section className="mx-auto mt-8 max-w-2xl">
          <PostServiceForm mode="create" locale={locale} networkSlug={networkSlug} />
        </section>
      </section>
    </main>
  );
}
