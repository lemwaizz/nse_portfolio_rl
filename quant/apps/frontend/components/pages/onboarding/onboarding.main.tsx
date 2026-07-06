"use client";
import { useState } from "react";
import { defineStepper } from "@stepperize/react";
import { Label } from "@frontend/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@frontend/components/ui/radio-group";
import {
  ArrowLeft,
  ArrowRight,
  FileChartLine,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash,
} from "lucide-react";
import { Button, buttonVariants } from "@frontend/components/ui/button";

import { AddRiskProfileFlowMainComponent } from "../add_risk_profile_flow/add_risk_profile_flow.main";
import { BuildPortfolioContent } from "./onboarding_build_portfolio";
import { OnBoardingRiskProfile } from "./onboarding_risk_profile";
import OnboardingReadyToOptimize from "./onboarding_ready_to_optimize";

const { Stepper } = defineStepper([
  { id: "portfolioBuild", title: "Build Your Portfolio" },
  { id: "riskProfile", title: "Risk Profile" },
  { id: "recommendation", title: "Recommendation" },
]);

const OnboardingMainComponent = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <Stepper.Root
      linear
      className="w-full max-w-4xl rounded-xl border bg-background p-6 shadow-sm mx-3 lg:mx-0"
    >
      {({ stepper }) => (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-3 items-center">
              {/* <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <ArrowLeft className="size-5" />
              </span> */}
              <Button
                variant="outline"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 hover:text-foreground text-muted-foreground`}
                disabled={!stepper.canPrev}
                onClick={() => {
                  if (stepper.canPrev) {
                    stepper.prev();
                  }
                }}
              >
                <div>
                  <ArrowLeft className="h-5 w-5 text-destructive" />
                  <span className="sr-only">Delete</span>
                </div>
              </Button>
              <span className="text-muted-foreground font-bold uppercase text-sm">
                {/* <ShieldCheck className="size-5" /> */}
                Onbaording Progress
              </span>
            </div>
            <Stepper.List className="flex gap-1.5">
              <Stepper.Items>
                {(step) => (
                  <Stepper.Item key={step.id} step={step.id}>
                    <Stepper.Indicator className="block h-1.5 w-6 rounded-full transition-colors data-[status=active]:bg-primary data-[status=previous]:bg-primary data-[status=upcoming]:bg-muted" />
                  </Stepper.Item>
                )}
              </Stepper.Items>
            </Stepper.List>
          </div>

          <h3 className="text-base font-semibold">{stepper.current.title}</h3>

          <div className="mt-4 min-h-32">
            <Stepper.Content step="portfolioBuild">
              <BuildPortfolioContent
                onNextPage={() => {
                  stepper.next();
                }}
              />
            </Stepper.Content>

            <Stepper.Content step="riskProfile" className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <OnBoardingRiskProfile
                  onNextPage={() => {
                    stepper.next();
                  }}
                  page="onboarding"
                />
              </div>
            </Stepper.Content>

            <Stepper.Content step="recommendation" className="space-y-3">
              <OnboardingReadyToOptimize
                onNextPage={() => {
                  stepper.next();
                }}
              />
            </Stepper.Content>
          </div>
        </>
      )}
    </Stepper.Root>
  );
};

export default OnboardingMainComponent;
