import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrivyLoginButton } from "@/components/auth/privy-login-button";
import { getPrivyUser } from "@/lib/auth/privy-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign Up",
  description: "Create your Bountix account.",
};

export default async function SignupPage() {
  const user = await getPrivyUser();
  if (user) redirect("/dashboard/profile");

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <div className="container-page py-8 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Bountix
        </Link>

        <section className="mx-auto mt-10 max-w-md">
          <div className="comic-card bg-white p-5 sm:p-6">
            <p className="comic-chip bg-[#38e7ff]">Create account</p>
            <h1 className="mt-5 text-2xl font-black text-[#140625]">
              Sign up for Bountix
            </h1>
            <p className="mt-3 text-sm font-medium leading-6 text-[#5a3b66]">
              Sign in with your email or crypto wallet to get started.
            </p>
            <div className="mt-6">
              <PrivyLoginButton />
            </div>
            <p className="mt-4 text-center text-sm font-medium leading-6 text-[#5a3b66]">
              Already on Bountix?{" "}
              <Link
                href="/login"
                className="font-black text-[#7c3cff] underline decoration-2 underline-offset-2"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
