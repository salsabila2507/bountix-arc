import { PostServiceForm } from "@/components/marketplace/post-service-form";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Offer a Service",
  description:
    "Create a Bountix service offer for the creator marketplace.",
};

export default function PostServicePage() {
  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page grid min-h-[calc(100vh-5rem)] gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="comic-chip bg-[#ffdd3d]">
            Creator workflow preview
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-[#140625] sm:text-6xl">
            Package your skill into a service offer.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#5a3b66]">
            This is an early access preview of how creators will package
            repeatable work. Sign up to create, apply, submit, chat, and earn
            through tasks.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 text-sm font-black text-[#140625] sm:grid-cols-3">
            {["Scope", "Starting price", "Inquiry flow"].map((item) => (
              <div
                key={item}
                className="rounded-lg border-2 border-[#140625] bg-white p-4 shadow-[4px_4px_0_#140625]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <PostServiceForm />
      </section>
    </main>
  );
}
