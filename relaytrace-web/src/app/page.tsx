import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { plansService }      from "@/services/plans.service";
import { PublicPlan }        from "@/types";

/**
 * Landing page — Server Component.
 *
 * Plans are fetched at build time (or in ISR background) via the public
 * GET /plans endpoint. The response is cached by Next.js for 5 minutes
 * (`revalidate: 300`), meaning users never wait for a DB query.
 *
 * Interactive state (modal, animations) lives in LandingPageClient.
 */
export const revalidate = 300; // ISR: revalidate every 5 min

export default async function LandingPage() {
  let plans: PublicPlan[] = [];

  try {
    plans = await plansService.getPublic();
  } catch {
    // If the API is unreachable at build time, render with empty plans array.
    // PricingSection handles the empty state gracefully.
  }

  return <LandingPageClient plans={plans} />;
}
