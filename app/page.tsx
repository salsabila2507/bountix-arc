import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { OperatorProfileSection } from "@/components/landing/operator-profile-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <SiteHeader />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <OperatorProfileSection />
      <FinalCtaSection />
    </main>
  );
}
