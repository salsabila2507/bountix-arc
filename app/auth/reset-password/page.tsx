import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password",
  description: "Reset your Bountix password.",
};

export default function ResetPasswordPage() {
  // Privy handles password reset through its own UI.
  redirect("/login");
}
