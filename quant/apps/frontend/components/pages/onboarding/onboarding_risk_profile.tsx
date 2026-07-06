"use client";
import {
  RiskProfileInvestmentGoalSchema,
  RiskProfileInvestmentHorizonSchema,
  RiskProfileLossReactionSchema,
  type RiskProfileInvestmentGoal,
  type RiskProfileinvestmentHorizon,
  type RiskProfileLossReaction,
} from "@/apps/coordinator/src/models/enums/enums";
import { apiClient } from "@/packages/clients/src";
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
import { toast } from "sonner";
import { Spinner } from "../../ui/spinner";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";

const { Stepper } = defineStepper([
  { id: "timeHorizon", title: "Time Horizon" },
  { id: "investmentGoal", title: "Investment Goal" },
  { id: "riskTolerance", title: "Risk Tolerance" },
]);

export function OnBoardingRiskProfile({
  onNextPage,
  page,
}: {
  onNextPage?: () => void;
  page: "onboarding" | "riskProfileUpdate";
}) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [insvestmentHorizon, setInvestementHorizon] =
    useState<RiskProfileinvestmentHorizon>();
  const [investmentGoal, setInvestmentGoal] =
    useState<RiskProfileInvestmentGoal>();
  const [lossReaction, setLossReaction] = useState<RiskProfileLossReaction>();

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
              {
                <>
                  <Stepper.Content step="timeHorizon">
                    <InvestmentHorizon
                      title="What is your investment horizon?"
                      description="Knowing how long you need to stay invested helps us balance risk and potential returns"
                      currentValue={insvestmentHorizon}
                      onSelected={(val) => {
                        setInvestementHorizon(
                          RiskProfileInvestmentHorizonSchema.safeParse(val)
                            .data ?? "long",
                        );
                      }}
                      items={[
                        {
                          Icon: Clock1,
                          label: "0 - 2 Years",
                          title: "Short Term",
                          value: "short",
                        },
                        {
                          Icon: BellDot,
                          label: "2 - 7 Years",
                          title: "Medium Term",
                          value: "medium",
                        },
                        {
                          Icon: CalendarDays,
                          label: "7+ Years",
                          title: "Long Term",
                          value: "long",
                        },
                      ]}
                    />
                  </Stepper.Content>
                  <Stepper.Content step="investmentGoal">
                    <InvestmentHorizon
                      title="What is your primary investment goal?"
                      description="Understanding your financial goal helps us recommend a portfolio strategy that aligns with what matters most to you."
                      currentValue={investmentGoal}
                      onSelected={(val) => {
                        setInvestmentGoal(
                          RiskProfileInvestmentGoalSchema.safeParse(val).data ??
                            "growWealth",
                        );
                      }}
                      items={[
                        {
                          Icon: Sprout,
                          value: "growWealth",
                          title: "Grow My Wealth",
                        },
                        {
                          Icon: PiggyBank,
                          value: "generateIncome",
                          title: "Generate Income",
                        },
                        {
                          Icon: Landmark,
                          value: "preserveCapital",
                          title: "Preserve My Capital",
                        },
                      ]}
                    />
                  </Stepper.Content>
                  <Stepper.Content step="riskTolerance">
                    <InvestmentHorizon
                      title="How would you react if your KES 100,000 investment dropped to KES 75,000 overnight?"
                      description="Market fluctuations are normal. Your response helps us understand how comfortable you are with investment risk."
                      currentValue={lossReaction}
                      onSelected={(val) => {
                        setLossReaction(
                          RiskProfileLossReactionSchema.safeParse(val).data ??
                            "hold",
                        );
                      }}
                      items={[
                        {
                          Icon: BrushCleaning,
                          title: "Sell Immediately",
                          value: "sellImmediately",
                        },
                        {
                          Icon: Pin,
                          value: "hold",
                          title: "Hold My Investment",
                        },
                        {
                          value: "buyMore",
                          Icon: ChartCandlestick,
                          title: "Invest More",
                        },
                      ]}
                    />
                  </Stepper.Content>
                </>
              }
            </div>

            <Stepper.Actions className="mt-6 flex justify-between">
              <Button asChild variant={"secondary"}>
                <Stepper.Prev>Back</Stepper.Prev>
              </Button>
              {stepper.isLast ? (
                isLoading ? (
                  <Spinner />
                ) : (
                  <Button
                    type="button"
                    onClick={async () => {
                      if (
                        !investmentGoal ||
                        !insvestmentHorizon ||
                        !lossReaction
                      ) {
                        toast.error(
                          "Provide answers to all risk profile assessment questions to continue",
                          {
                            className: "text-foreground",
                          },
                        );
                        return;
                      }
                      try {
                        setLoading(true);
                        await apiClient.api["risk-profile"].put({
                          investmentGoal: investmentGoal!,
                          investmentHorizon: insvestmentHorizon!,
                          lossReaction: lossReaction!,
                        });
                        if (page === "onboarding") {
                          onNextPage?.();
                        } else if (page === "riskProfileUpdate") {
                          mutate("/risk-profile");
                          router.push("/dashboard/risk-profile");
                        }
                      } catch (e) {
                        console.log(e);
                        toast.error("An error occured sending your request", {
                          className: "text-foreground",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Submit
                  </Button>
                )
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
  currentValue,
  onSelected,
}: {
  title: string;
  description: string;
  items: { Icon: LucideIcon; title: string; label?: string; value: string }[];
  currentValue?: string;
  onSelected: (val: string) => void;
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
              isSelected={currentValue === items.value}
              setValue={onSelected}
              value={items.value}
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
  isSelected,
  value,
  setValue,
}: {
  Icon: LucideIcon;
  title: string;
  label?: string;
  value: string;
  isSelected: boolean;
  setValue: (val: string) => void;
}) => {
  return (
    <div
      onClick={() => {
        setValue(value);
      }}
      className={`${isSelected ? "bg-primary" : "hover:bg-accent"} cursor-pointer flex flex-col items-center justify-center border rounded-md px-2 py-8`}
    >
      <div
        className={`${isSelected ? "text-primary-foreground" : "text-muted-foreground"} mb-3`}
      >
        <Icon />
      </div>
      <div
        className={`${isSelected ? "text-muted font-bold" : ""} text-xs text-center`}
      >
        {title}
      </div>
      {label && (
        <div
          className={`${isSelected ? "text-primary-foreground" : "text-muted-foreground"} text-xs text-center`}
        >
          {label}
        </div>
      )}
    </div>
  );
};
