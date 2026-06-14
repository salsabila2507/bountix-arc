import { cookies } from "next/headers";
import { getNetworkConfig, type NetworkConfig } from "@/lib/networks";
import { NETWORK_COOKIE, parseNetworkSlug } from "@/lib/networks";

export async function getServerNetwork(): Promise<NetworkConfig> {
  const cookieStore = await cookies();
  const slug = cookieStore.get(NETWORK_COOKIE)?.value;
  return getNetworkConfig(parseNetworkSlug(slug));
}

export async function getServerNetworkSlug(): Promise<string> {
  const cookieStore = await cookies();
  return parseNetworkSlug(cookieStore.get(NETWORK_COOKIE)?.value);
}
