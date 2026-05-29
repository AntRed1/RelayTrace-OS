"use client";

import { useState }              from "react";
import { LandingNav }            from "@/components/landing/LandingNav";
import { HeroSection }           from "@/components/landing/HeroSection";
import { ProblemSection }        from "@/components/landing/ProblemSection";
import { WorkflowSection }       from "@/components/landing/WorkflowSection";
import { FeaturesSection }       from "@/components/landing/FeaturesSection";
import { PricingSection }        from "@/components/landing/PricingSection";
import { CtaSection }            from "@/components/landing/CtaSection";
import { LandingFooter }         from "@/components/landing/LandingFooter";
import { RequestAccessModal }    from "@/components/landing/RequestAccessModal";
import { PublicPlan }            from "@/types";

interface Props {
  plans: PublicPlan[];
}

/**
 * Client wrapper for the landing page.
 *
 * Plans are pre-fetched by the Server Component via ISR and passed as props.
 * This component owns the modal open/close state — no extra API calls needed.
 */
export function LandingPageClient({ plans }: Props) {
  // null = modal closed; string = modal open pre-selecting that plan slug
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  /** Opens the modal. Falls back to the most-popular plan when no slug is given. */
  const openModal  = (slug?: string) => setSelectedPlan(slug ?? null);
  const closeModal = ()              => setSelectedPlan(null);

  return (
    <>
      <LandingNav      onRequestAccess={() => openModal()} />
      <HeroSection     onRequestAccess={() => openModal()} />
      <ProblemSection  />
      <WorkflowSection />
      <FeaturesSection />
      <PricingSection  plans={plans} onSelectPlan={openModal} />
      <CtaSection      onRequestAccess={() => openModal()} />
      <LandingFooter   />

      {/*
        plans is passed so RequestAccessModal never reads from a hardcoded config.
        initialPlan is undefined when opened from Nav/Hero/CTA (falls back to isPopular),
        or a specific slug when opened from a PricingSection CTA button.
      */}
      <RequestAccessModal
        open={selectedPlan !== null}
        plans={plans}
        initialPlan={selectedPlan ?? undefined}
        onClose={closeModal}
      />
    </>
  );
}
