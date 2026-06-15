import { getPrivyUser, type PrivyUser } from "./privy-server";
import { createClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  privyDid: string;
  email: string | null;
  walletAddress: `0x${string}` | null;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const privyUser: PrivyUser | null = await getPrivyUser();
  if (!privyUser) return null;

  return {
    id: privyUser.id,
    privyDid: privyUser.id,
    email: privyUser.email,
    walletAddress: privyUser.walletAddress,
  };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
