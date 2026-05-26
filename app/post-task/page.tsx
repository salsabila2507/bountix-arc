import { PostTaskForm } from "@/components/marketplace/post-task-form";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Post a Task",
  description: "Post a Bountix task with budget, negotiation, and payment mode.",
};

export default function PostTaskPage() {
  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page grid min-h-[calc(100vh-5rem)] gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="comic-chip bg-[#38e7ff]">
            Client workflow
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-[#140625] sm:text-6xl">
            Turn work into a clear task brief.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#5a3b66]">
            Set the reward, outline acceptance criteria, and invite operators to
            submit proof.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 text-sm font-black text-[#140625] sm:grid-cols-3">
            {["Budget", "Negotiation", "Escrow mode"].map((item) => (
              <div
                key={item}
                className="rounded-lg border-2 border-[#140625] bg-white p-4 shadow-[4px_4px_0_#140625]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <PostTaskForm />
      </section>
    </main>
  );
}
