import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign Up",
  description:
    "Bountix is open in early access. Sign up to create, apply, submit, chat, and earn through tasks.",
};

export default function WaitlistPage() {
  redirect("/signup");
}
