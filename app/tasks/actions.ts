"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TASK_STATUSES,
  TASK_TYPES,
  isAdminTaskType,
  isUuid,
  type TaskStatus,
  type TaskType,
} from "@/lib/tasks";
import type { TaskFormState } from "@/lib/task-form-state";

type ParsedTaskInput = {
  title: string;
  description: string;
  category: string | null;
  reward_amount: number | null;
  status: TaskStatus;
  task_type: TaskType;
  external_link: string | null;
  start_date: string | null;
  end_date: string | null;
};

function isHttpsHttp(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseTaskInput(formData: FormData): {
  data: ParsedTaskInput;
  fieldErrors: TaskFormState["fieldErrors"];
} {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const rewardRaw = String(formData.get("reward_amount") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const task_type = String(formData.get("task_type") ?? "user_task");
  const external_link = String(formData.get("external_link") ?? "").trim();
  const start_date_raw = String(formData.get("start_date") ?? "").trim();
  const end_date_raw = String(formData.get("end_date") ?? "").trim();

  const fieldErrors: TaskFormState["fieldErrors"] = {};

  if (title.length < 4 || title.length > 140) {
    fieldErrors.title = "Title must be 4–140 characters.";
  }
  if (description.length < 1 || description.length > 4000) {
    fieldErrors.description = "Description is required (up to 4000 chars).";
  }
  if (category && category.length > 60) {
    fieldErrors.category = "Category must be 60 characters or fewer.";
  }

  let reward_amount: number | null = null;
  if (rewardRaw) {
    const n = Number(rewardRaw);
    if (!Number.isFinite(n) || n < 0) {
      fieldErrors.reward_amount = "Reward must be a non-negative number.";
    } else if (n > 9_999_999.99) {
      fieldErrors.reward_amount = "Reward is too large.";
    } else {
      reward_amount = Math.round(n * 100) / 100;
    }
  }

  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    fieldErrors.status = "Invalid status.";
  }
  if (!(TASK_TYPES as readonly string[]).includes(task_type)) {
    fieldErrors.task_type = "Invalid task type.";
  }
  if (external_link) {
    if (external_link.length > 500) {
      fieldErrors.external_link =
        "Link must be 500 characters or fewer.";
    } else if (!isHttpsHttp(external_link)) {
      fieldErrors.external_link = "Use a valid http(s) URL.";
    }
  }

  const start_date = start_date_raw
    ? new Date(start_date_raw).toISOString()
    : null;
  const end_date = end_date_raw
    ? new Date(end_date_raw).toISOString()
    : null;
  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    fieldErrors.end_date = "End date must be on or after start date.";
  }

  return {
    data: {
      title,
      description,
      category: category || null,
      reward_amount,
      status: status as TaskStatus,
      task_type: task_type as TaskType,
      external_link: external_link || null,
      start_date,
      end_date,
    },
    fieldErrors,
  };
}

/**
 * Read role + can_use_platform via dedicated query.
 * Cheap (single row, primary key, RLS allows owner read).
 */
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

export async function createTaskAction(
  _previous: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const { supabase, user, profile } = await loadActor();
  if (!user) redirect("/login");
  if (!profile) {
    return {
      status: "error",
      message: "Your profile is missing. Refresh and try again.",
    };
  }

  const isAdmin = profile.role === "admin";
  const canCreate = profile.can_use_platform || isAdmin;

  if (!canCreate) {
    return {
      status: "error",
      message:
        "Your account does not have create access yet. Wait for early access to unlock.",
    };
  }

  const { data, fieldErrors } = parseTaskInput(formData);
  if (Object.keys(fieldErrors ?? {}).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  // Non-admins can only create user_task.
  let task_type = data.task_type;
  if (!isAdmin && isAdminTaskType(task_type)) {
    return {
      status: "error",
      message: `Only admins can post a ${task_type}.`,
      fieldErrors: { task_type: "Pick 'user_task'." },
    };
  }
  if (!isAdmin) task_type = "user_task";

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      creator_id: user.id,
      title: data.title,
      description: data.description,
      category: data.category,
      reward_amount: data.reward_amount,
      reward_currency: "USDC",
      chain: "base",
      status: data.status,
      task_type,
      external_link: data.external_link,
      start_date: data.start_date,
      end_date: data.end_date,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: error.message || "Could not create task right now.",
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard/tasks");

  if (inserted?.id) {
    redirect(`/tasks/${inserted.id}`);
  }

  return { status: "success", message: "Task created." };
}

export async function updateTaskAction(
  taskId: string,
  _previous: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  if (!isUuid(taskId)) {
    return { status: "error", message: "Invalid task id." };
  }

  const { supabase, user, profile } = await loadActor();
  if (!user) redirect("/login");
  if (!profile) {
    return {
      status: "error",
      message: "Your profile is missing. Refresh and try again.",
    };
  }

  const isAdmin = profile.role === "admin";
  const canEdit = profile.can_use_platform || isAdmin;

  if (!canEdit) {
    return {
      status: "error",
      message:
        "Your account does not have edit access yet. Wait for early access to unlock.",
    };
  }

  const { data, fieldErrors } = parseTaskInput(formData);
  if (Object.keys(fieldErrors ?? {}).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  let task_type = data.task_type;
  if (!isAdmin && isAdminTaskType(task_type)) {
    return {
      status: "error",
      message: `Only admins can use ${task_type}.`,
      fieldErrors: { task_type: "Pick 'user_task'." },
    };
  }
  if (!isAdmin) task_type = "user_task";

  const { error } = await supabase
    .from("tasks")
    .update({
      title: data.title,
      description: data.description,
      category: data.category,
      reward_amount: data.reward_amount,
      reward_currency: "USDC",
      chain: "base",
      status: data.status,
      task_type,
      external_link: data.external_link,
      start_date: data.start_date,
      end_date: data.end_date,
    })
    .eq("id", taskId);

  if (error) {
    return {
      status: "error",
      message: error.message || "Could not save task right now.",
    };
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard/tasks");

  return { status: "success", message: "Task updated.", taskId };
}

export async function deleteTaskAction(taskId: string): Promise<void> {
  if (!isUuid(taskId)) return;

  const { supabase, user } = await loadActor();
  if (!user) redirect("/login");

  await supabase.from("tasks").delete().eq("id", taskId);

  revalidatePath("/tasks");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks");
}

// Note: this is a "use server" file — only async functions may be exported.
// Types and constants live in /lib/tasks.ts and /lib/task-form-state.ts.
