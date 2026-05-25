export const roles = ["Creator", "Operator", "Both"] as const;

export type WaitlistRole = (typeof roles)[number];

export type FieldErrors = {
  name?: string;
  email?: string;
  role?: string;
  specialty?: string;
};

export type WaitlistFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: FieldErrors;
};

export const initialWaitlistState: WaitlistFormState = {
  status: "idle",
  message: "",
};

export function validateWaitlistForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const specialty = String(formData.get("specialty") ?? "").trim();
  const errors: FieldErrors = {};

  if (name.length < 2) {
    errors.name = "Enter your name or operator handle.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!roles.includes(role as WaitlistRole)) {
    errors.role = "Choose how you want to use TaskOps.";
  }

  if (specialty.length > 120) {
    errors.specialty = "Keep specialties under 120 characters.";
  }

  return {
    data: {
      name,
      email,
      role: role as WaitlistRole,
      specialty: specialty || null,
    },
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
