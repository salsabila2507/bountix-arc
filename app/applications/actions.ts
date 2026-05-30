"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/tasks";
import type {
  ApplyState,
  SubmitState,
} from "@/lib/application-form-state";

async function loadActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, can_use_platform")
    .eq("id", user.id)
    .maybeSingle();
  return {
    supabase,
    user,
    profile: profile as
      | { id: string; role: string; can_use_platform: boolean }
      | null,
  };
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// =====================================================================
// Applications
// =====================================================================

export async function applyToTaskAction(
  taskId: string,
  _previous: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  if (!isUuid(taskId)) return { status: "error", message: "Invalid task id." };

  const { supabase, user, profile } = await loadActor();
  if (!user) redirect("/login");
  if (!profile) {
    return { status: "error", message: "Your profile is missing." };
  }

  if (!profile.can_use_platform && profile.role !== "admin") {
    return {
      status: "error",
      message:
        "Early access required. Wait for your account to be activated to apply.",
    };
  }

  const message = String(formData.get("message") ?? "").trim();
  if (message.length > 1000) {
    return { status: "error", message: "Message must be 1000 chars or fewer." };
  }

  const { error } = await supabase.from("task_applications").insert({
    task_id: taskId,
    applicant_id: user.id,
    message: message || null,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "You already applied to this task.",
      };
    }
    return {
      status: "error",
      message: error.message || "Could not submit application.",
    };
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/dashboard/applications`);
  return { status: "success", message: "Application submitted." };
}

export async function withdrawApplicationAction(applicationId: string) {
  if (!isUuid(applicationId)) return;
  const { supabase, user } = await loadActor();
  if (!user) redirect("/login");

  const { data: app } = await supabase
    .from("task_applications")
    .select("task_id")
    .eq("id", applicationId)
    .maybeSingle();

  await supabase
    .from("task_applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId);

  if (app?.task_id) revalidatePath(`/tasks/${app.task_id}`);
  revalidatePath(`/dashboard/applications`);
}

export async function decideApplicationAction(
  applicationId: string,
  decision: "accepted" | "rejected",
) {
  if (!isUuid(applicationId)) return;
  if (decision !== "accepted" && decision !== "rejected") return;
  const { supabase, user } = await loadActor();
  if (!user) redirect("/login");

  const { data: app } = await supabase
    .from("task_applications")
    .select("task_id")
    .eq("id", applicationId)
    .maybeSingle();

  await supabase
    .from("task_applications")
    .update({ status: decision })
    .eq("id", applicationId);

  if (app?.task_id) {
    revalidatePath(`/tasks/${app.task_id}`);
    revalidatePath(`/dashboard/tasks/${app.task_id}/applicants`);
  }
}

// =====================================================================
// Submissions
// =====================================================================

export async function createSubmissionAction(
  applicationId: string,
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (!isUuid(applicationId))
    return { status: "error", message: "Invalid application." };

  const { supabase, user } = await loadActor();
  if (!user) redirect("/login");

  const delivery_url = String(formData.get("delivery_url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const fieldErrors: SubmitState["fieldErrors"] = {};

  if (!delivery_url) fieldErrors.delivery_url = "Delivery link is required.";
  else if (!isHttpUrl(delivery_url))
    fieldErrors.delivery_url = "Use a valid http(s) URL.";
  else if (delivery_url.length > 500)
    fieldErrors.delivery_url = "Link is too long (max 500).";
  if (notes.length > 2000)
    fieldErrors.notes = "Notes must be 2000 chars or fewer.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  const { data: app } = await supabase
    .from("task_applications")
    .select("task_id")
    .eq("id", applicationId)
    .maybeSingle();
  if (!app?.task_id) {
    return { status: "error", message: "Application not found." };
  }

  const { error } = await supabase.from("task_submissions").insert({
    task_id: app.task_id,
    application_id: applicationId,
    submitter_id: user.id,
    delivery_url,
    notes: notes || null,
    status: "pending_review",
  });

  if (error) {
    return { status: "error", message: error.message || "Could not submit." };
  }

  revalidatePath(`/tasks/${app.task_id}`);
  revalidatePath(`/dashboard/applications`);
  return { status: "success", message: "Submission posted for review." };
}

export async function updateSubmissionAction(
  submissionId: string,
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (!isUuid(submissionId))
    return { status: "error", message: "Invalid submission." };

  const { supabase, user } = await loadActor();
  if (!user) redirect("/login");

  const delivery_url = String(formData.get("delivery_url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const fieldErrors: SubmitState["fieldErrors"] = {};

  if (!delivery_url) fieldErrors.delivery_url = "Delivery link is required.";
  else if (!isHttpUrl(delivery_url))
    fieldErrors.delivery_url = "Use a valid http(s) URL.";
  if (notes.length > 2000)
    fieldErrors.notes = "Notes must be 2000 chars or fewer.";
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  const { data: row } = await supabase
    .from("task_submissions")
    .select("task_id")
    .eq("id", submissionId)
    .maybeSingle();

  const { error } = await supabase
    .from("task_submissions")
    .update({ delivery_url, notes: notes || null })
    .eq("id", submissionId);

  if (error) {
    return { status: "error", message: error.message };
  }

  if (row?.task_id) revalidatePath(`/tasks/${row.task_id}`);
  return { status: "success", message: "Submission updated." };
}

export async function reviewSubmissionAction(
  submissionId: string,
  formData: FormData,
) {
  if (!isUuid(submissionId)) return;

  const decision = String(formData.get("decision") ?? "");
  if (
    decision !== "approved" &&
    decision !== "rejected" &&
    decision !== "revision_requested"
  ) {
    return;
  }
  const review_notes = String(formData.get("review_notes") ?? "").trim();

  const { supabase, user } = await loadActor();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("task_submissions")
    .select("task_id")
    .eq("id", submissionId)
    .maybeSingle();

  await supabase
    .from("task_submissions")
    .update({
      status: decision,
      review_notes: review_notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (row?.task_id) {
    revalidatePath(`/tasks/${row.task_id}`);
    revalidatePath(`/dashboard/tasks/${row.task_id}/applicants`);
  }
}
