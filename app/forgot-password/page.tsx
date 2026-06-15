import { redirect } from "next/navigation";
import { getPrivyUser } from "@/lib/auth/privy-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your Bountix password.",
};

export default async function ForgotPasswordPage() {
  const user = await getPrivyUser();
  if (user) redirect("/dashboard/profile");

  // Privy handles password reset through its own UI.
  // Redirect to login where users can sign in with email OTP / magic link.
  redirect("/login");
}
