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

export function LandingPageClient({ plans }: Props) {
  // Separate open flag from slug so openModal() with no args still opens the modal
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);

  const openModal  = (slug?: string) => {
    setSelectedSlug(slug);   // undefined → modal resolves to most-popular plan
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

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

      <RequestAccessModal
        open={modalOpen}
        plans={plans}
        initialPlan={selectedSlug}
        onClose={closeModal}
      />
    </>
  );
}
