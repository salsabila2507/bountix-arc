"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/tasks";

export async function setEarlyContributorAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const isEarlyContributor =
    String(formData.get("is_early_contributor") ?? "") === "true";

  if (!isUuid(profileId)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: actor } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (actor?.role !== "admin") redirect("/dashboard/profile");

  const { data: target } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", profileId)
    .maybeSingle();

  const { error } = await supabase
    .from("profiles")
    .update({ is_early_contributor: isEarlyContributor })
    .eq("id", profileId);

  if (error) return;

  revalidatePath("/admin");
  revalidatePath("/dashboard/profile");
  if (target?.username) {
    revalidatePath(`/profile/${target.username}`);
  }
}
