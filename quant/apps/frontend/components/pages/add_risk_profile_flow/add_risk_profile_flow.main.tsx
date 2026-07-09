"use client";
import { Button } from "@frontend/components/ui/button";
import { defineStepper } from "@stepperize/react";
import {
  BellDot,
  BrushCleaning,
  CalendarDays,
  ChartCandlestick,
  Clock1,
  Landmark,
  type LucideIcon,
  PiggyBank,
  Pin,
  Sprout,
} from "lucide-react";
import { useState } from "react";

const { Stepper } = defineStepper([
  { id: "timeHorizon", title: "Time Horizon" },
  { id: "investmentGoal", title: "Investment Goal" },
  { id: "riskTolerance", title: "Risk Tolerance" },
]);

export function AddRiskProfileFlowMainComponent() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Stepper.Root
      linear
      className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm"
    >
      {({ stepper }) => {
        const progress = Math.round(
          ((stepper.index + 1) / stepper.count) * 100,
        );
        return (
          <>
            <div className="uppercase text-xs text-muted-foreground">
              Question {stepper.index + 1} 0f {stepper.count}
            </div>
            <div className="mb-3 flex items-center justify-between text-sm">
              {/* <span className="font-medium">{stepper.current.title}</span> */}
              <span className="text-sm">Investor risk profiling</span>
              <span className="text-primary">{progress}% complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* <div className="mt-6 grid min-h-24 place-items-center rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground"> */}
            <div className="mt-6 ">
              {submitted ? (
                <div>
                  <p className="font-medium text-foreground">Form submitted</p>
                  <p className="mt-1 text-xs">
                    Your details are ready for review.
                  </p>
                </div>
              ) : (
                <>
                  <Stepper.Content step="timeHorizon">
                    <InvestmentHorizon
                      title="What is your investment horizon?"
                      description="Knowing how long you need to stay invested helps us balance risk and potential returns"
                      items={[
                        {
                          Icon: CalendarDays,
                          label: "7+ Years",
                          title: "Long Term",
                        },
                        {
                          Icon: BellDot,
                          label: "2 - 7 Years",
                          title: "Medium Term",
                        },
                        {
                          Icon: Clock1,
                          label: "0 - 2 Years",
                          title: "Short Term",
                        },
                      ]}
                    />
                  </Stepper.Content>
                  <Stepper.Content step="investmentGoal">
                    <InvestmentHorizon
                      title="What is your primary investment goal?"
                      description="Understanding your financial goal helps us recommend a portfolio strategy that aligns with what matters most to you."
                      items={[
                        {
                          Icon: Landmark,
                          title: "Preserve My Capital",
                        },
                        {
                          Icon: PiggyBank,
                          title: "Generate Income",
                        },
                        {
                          Icon: Sprout,
                          title: "Grow My Wealth",
                        },
                      ]}
                    />
                  </Stepper.Content>
                  <Stepper.Content step="riskTolerance">
                    <InvestmentHorizon
                      title="How would you react if your KES 100,000 investment dropped to KES 75,000 overnight?"
                      description="Market fluctuations are normal. Your response helps us understand how comfortable you are with investment risk."
                      items={[
                        {
                          Icon: BrushCleaning,
                          title: "Sell Immediately",
                        },
                        {
                          Icon: Pin,
                          title: "Hold My Investment",
                        },
                        {
                          Icon: ChartCandlestick,
                          title: "Invest More",
                        },
                      ]}
                    />
                  </Stepper.Content>
                </>
              )}
            </div>

            <Stepper.Actions className="mt-6 flex justify-between">
              <Button asChild variant={"secondary"}>
                <Stepper.Prev>Back</Stepper.Prev>
              </Button>
              {submitted ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    stepper.reset();
                  }}
                >
                  Restart flow
                </Button>
              ) : stepper.isLast ? (
                <Button type="button" onClick={() => setSubmitted(true)}>
                  Submit form
                </Button>
              ) : (
                <Button asChild>
                  <Stepper.Next>Continue</Stepper.Next>
                </Button>
              )}
            </Stepper.Actions>
          </>
        );
      }}
    </Stepper.Root>
  );
}

const InvestmentHorizon = ({
  description,
  items,
  title,
}: {
  title: string;
  description: string;
  items: { Icon: LucideIcon; title: string; label?: string }[];
}) => {
  return (
    <div>
      <div className="font-medium text-lg my-4">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <div className="grid grid-cols-3 gap-3 my-8">
        {items.map((items, index) => {
          return (
            <RiskProfileItemCard
              key={index}
              Icon={items.Icon}
              label={items.label}
              title={items.title}
            />
          );
        })}
      </div>
    </div>
  );
};

const RiskProfileItemCard = ({
  Icon,
  label,
  title,
}: {
  Icon: LucideIcon;
  title: string;
  label?: string;
}) => {
  return (
    <div className="cursor-pointer hover:bg-accent flex flex-col items-center justify-center border rounded-md px-2 py-8">
      <div className="text-muted-foreground mb-3">
        <Icon />
      </div>
      <div className="text-xs text-center">{title}</div>
      {label && (
        <div className="text-muted-foreground text-xs text-center">{label}</div>
      )}
    </div>
  );
};
