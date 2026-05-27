"use client";

import { useState } from "react";
import { LandingNav }         from "@/components/landing/LandingNav";
import { HeroSection }        from "@/components/landing/HeroSection";
import { ProblemSection }     from "@/components/landing/ProblemSection";
import { WorkflowSection }    from "@/components/landing/WorkflowSection";
import { FeaturesSection }    from "@/components/landing/FeaturesSection";
import { PricingSection }     from "@/components/landing/PricingSection";
import { CtaSection }         from "@/components/landing/CtaSection";
import { LandingFooter }      from "@/components/landing/LandingFooter";
import { RequestAccessModal } from "@/components/landing/RequestAccessModal";
import { PlanName }           from "@/config/plan.config";

export default function LandingPage() {
  // null = modal closed; any PlanName = modal open with that plan pre-selected
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);

  const openModal   = (plan: PlanName = "growth") => setSelectedPlan(plan);
  const closeModal  = () => setSelectedPlan(null);

  return (
    <>
      <LandingNav      onRequestAccess={() => openModal()} />
      <HeroSection     onRequestAccess={() => openModal()} />
      <ProblemSection  />
      <WorkflowSection />
      <FeaturesSection />
      <CtaSection      onRequestAccess={() => openModal()} />
      <PricingSection  onSelectPlan={openModal} />
      <LandingFooter   />

      <RequestAccessModal
        open={selectedPlan !== null}
        initialPlan={selectedPlan ?? "growth"}
        onClose={closeModal}
      />
    </>
  );
}
