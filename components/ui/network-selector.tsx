"use client";

import { useRouter } from "next/navigation";
import { NETWORK_COOKIE, NETWORKS } from "@/lib/networks";

export function NetworkSelector({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    document.cookie = `${NETWORK_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <select
      value={currentSlug}
      onChange={handleChange}
      className="rounded-lg border-2 border-[#140625] bg-white px-3 py-1.5 text-xs font-bold text-[#140625] shadow-[2px_2px_0_#140625] transition hover:bg-[#f0d7ff] focus:outline-none focus:ring-2 focus:ring-[#7c3cff]"
    >
      {Object.values(NETWORKS).map((net) => (
        <option key={net.slug} value={net.slug}>
          {net.name}
        </option>
      ))}
    </select>
  );
}
