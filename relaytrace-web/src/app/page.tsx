"use client";

import { useState } from "react";
import { LandingNav }          from "@/components/landing/LandingNav";
import { HeroSection }         from "@/components/landing/HeroSection";
import { ProblemSection }      from "@/components/landing/ProblemSection";
import { WorkflowSection }     from "@/components/landing/WorkflowSection";
import { FeaturesSection }     from "@/components/landing/FeaturesSection";
import { PricingSection }      from "@/components/landing/PricingSection";
import { CtaSection }          from "@/components/landing/CtaSection";
import { LandingFooter }       from "@/components/landing/LandingFooter";
import { RequestAccessModal }  from "@/components/landing/RequestAccessModal";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <LandingNav onRequestAccess={() => setModalOpen(true)} />
      <HeroSection onRequestAccess={() => setModalOpen(true)} />
      <ProblemSection />
      <WorkflowSection />
      <FeaturesSection />
      <CtaSection onRequestAccess={() => setModalOpen(true)} />
      <PricingSection onRequestAccess={() => setModalOpen(true)} />
      <LandingFooter />
      <RequestAccessModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
