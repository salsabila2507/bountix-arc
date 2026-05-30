export type AuthFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export const initialAuthState: AuthFormState = { status: "idle", message: "" };
