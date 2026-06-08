import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageCircleMore } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TencentChatShell } from "@/components/chat/tencent-chat-shell";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  loadTencentChatPeers,
  loadTencentChatSession,
} from "@/lib/tencent-chat";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chat",
  description: "Realtime Tencent Chat for Bountix users.",
};

type RouteParams = {
  searchParams: Promise<{ peer?: string }>;
};

export default async function DashboardChatPage({ searchParams }: RouteParams) {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  const [session, peers, params] = await Promise.all([
    loadTencentChatSession(),
    loadTencentChatPeers(),
    searchParams,
  ]);

  if (!session) redirect("/login");

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t("common.backToDashboard")}
        </Link>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <p className="comic-chip bg-[#38e7ff]">
              <MessageCircleMore aria-hidden="true" className="h-3.5 w-3.5" />
              {t("dashboard.chat.chip")}
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase leading-none sm:text-5xl">
              {t("dashboard.chat.title")}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-[#5a3b66]">
              {t("dashboard.chat.body")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-10 items-center rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
              {t("dashboard.chat.currentUser")}
              <span className="ml-2 text-[#7c3cff]">
                @{session.profile.username}
              </span>
            </span>
            <span className="inline-flex min-h-10 items-center rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
              {t("dashboard.chat.tencentId")}
              <span className="ml-2 text-[#7c3cff]">
                {session.profile.tencent_user_id}
              </span>
            </span>
          </div>

          <p className="max-w-3xl text-xs font-bold leading-6 text-[#5a3b66]">
            {t("dashboard.chat.attachments")}
          </p>
        </div>

        <div className="mt-8">
          <TencentChatShell
            session={session}
            peers={peers}
            locale={locale}
            initialPeerUserId={params.peer ?? null}
          />
        </div>
      </section>
    </main>
  );
}
