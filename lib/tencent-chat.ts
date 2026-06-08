import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export const TENCENT_CHAT_USER_ID_PREFIX = "bx_";
export const TENCENT_CHAT_USER_SIG_EXPIRE_SECONDS = 24 * 60 * 60;

export type TencentChatProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  tencent_user_id: string;
};

export type TencentChatSession = {
  sdkAppId: number;
  userId: string;
  userSig: string;
  profile: TencentChatProfile;
};

export type TencentChatPeer = TencentChatProfile & {
  skills: string[];
};

function hashToTencentUserId(input: string) {
  return `${TENCENT_CHAT_USER_ID_PREFIX}${crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .slice(0, 24)}`;
}

export function deriveTencentChatUserId(profileId: string) {
  return hashToTencentUserId(profileId);
}

function getTencentChatAppId() {
  const raw = process.env.TENCENT_CHAT_SDK_APP_ID;
  if (!raw) {
    throw new Error("Missing TENCENT_CHAT_SDK_APP_ID.");
  }

  const sdkAppId = Number(raw);
  if (!Number.isInteger(sdkAppId) || sdkAppId <= 0) {
    throw new Error("TENCENT_CHAT_SDK_APP_ID must be a positive integer.");
  }

  return sdkAppId;
}

function getTencentChatSecretKey() {
  const secretKey = process.env.TENCENT_CHAT_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("Missing TENCENT_CHAT_SECRET_KEY.");
  }
  return secretKey;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "*")
    .replace(/\//g, "-")
    .replace(/=/g, "~");
}

function hmacSha256Base64(secretKey: string, content: string) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(content, "utf8")
    .digest("base64");
}

export function createTencentChatUserSig({
  sdkAppId,
  userId,
  secretKey,
  expireSeconds = TENCENT_CHAT_USER_SIG_EXPIRE_SECONDS,
  now = Math.floor(Date.now() / 1000),
}: {
  sdkAppId: number;
  userId: string;
  secretKey: string;
  expireSeconds?: number;
  now?: number;
}) {
  const content = [
    `TLS.identifier:${userId}`,
    `TLS.sdkappid:${sdkAppId}`,
    `TLS.time:${now}`,
    `TLS.expire:${expireSeconds}`,
    "",
  ].join("\n");

  const sig = hmacSha256Base64(secretKey, content);
  const payload = {
    "TLS.ver": "2.0",
    "TLS.identifier": userId,
    "TLS.sdkappid": sdkAppId,
    "TLS.expire": expireSeconds,
    "TLS.time": now,
    "TLS.sig": sig,
  };

  return base64UrlEncode(JSON.stringify(payload));
}

export async function loadTencentChatSession(): Promise<TencentChatSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const sdkAppId = getTencentChatAppId();
  const secretKey = getTencentChatSecretKey();
  const userId = deriveTencentChatUserId(profile.id);
  const userSig = createTencentChatUserSig({
    sdkAppId,
    userId,
    secretKey,
  });

  return {
    sdkAppId,
    userId,
    userSig,
    profile: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      tencent_user_id: userId,
    },
  };
}

export async function loadTencentChatPeers(limit = 12) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const safeLimit = Math.min(Math.max(limit, 1), 24);
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, role, skills",
    )
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  return ((data ?? []) as Array<Omit<TencentChatPeer, "tencent_user_id">>).map((peer) => ({
    ...peer,
    tencent_user_id: deriveTencentChatUserId(peer.id),
  }));
}
