"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loadNotifications } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";
import { getAuthCtx } from "@/lib/auth/db-ctx";
import { isUuid } from "@/lib/tasks";

function revalidateNotificationPaths() {
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get("notification_id") ?? "");
  if (!isUuid(notificationId)) return;

  const ctx = await getAuthCtx();
  if (!ctx) redirect("/login");
  const { supabase, userId: actorId } = ctx;

  const { data: notification } = await supabase
    .from("notifications")
    .select("id, user_id")
    .eq("id", notificationId)
    .maybeSingle();

  if (!notification) return;

  const readAt = new Date().toISOString();
  const targetUserId = (notification as { user_id: string | null }).user_id;

  if (targetUserId === actorId) {
    await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", notificationId)
      .eq("user_id", actorId);
  } else if (targetUserId === null) {
    await supabase.from("notification_reads").upsert(
      {
        notification_id: notificationId,
        user_id: actorId,
        read_at: readAt,
      },
      { onConflict: "notification_id,user_id" },
    );
  }

  revalidateNotificationPaths();
}

export async function markAllNotificationsReadAction() {
  const data = await loadNotifications();
  if (!data) redirect("/login");

  const unread = data.notifications.filter(
    (notification) => !notification.effective_read_at,
  );
  if (unread.length === 0) return;

  const supabase = await createClient();
  const readAt = new Date().toISOString();
  const ownIds = unread
    .filter((notification) => !notification.is_global)
    .map((notification) => notification.id);
  const globalIds = unread
    .filter((notification) => notification.is_global)
    .map((notification) => notification.id);

  if (ownIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", data.userId)
      .in("id", ownIds);
  }

  if (globalIds.length > 0) {
    await supabase.from("notification_reads").upsert(
      globalIds.map((notificationId) => ({
        notification_id: notificationId,
        user_id: data.userId,
        read_at: readAt,
      })),
      { onConflict: "notification_id,user_id" },
    );
  }

  revalidateNotificationPaths();
}
