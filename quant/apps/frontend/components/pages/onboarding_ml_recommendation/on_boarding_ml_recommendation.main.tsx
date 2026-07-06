"use client";

import { Card, CardContent, CardFooter } from "@frontend/components/ui/card";
import Stats13, { type ChartProps } from "./recommendation_pie";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CirclePlus,
  Lock,
  Sparkles,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import type {
  RecommendationResponse,
  RLRecommendation,
} from "@/apps/coordinator/src/models/resources";
import { STOCK_META } from "@/apps/frontend/configs/risk_profile_mapping";

type AllocationChangeType = "NEW" | "INCREASE" | "DECREASE" | "HOLD";

interface AllocationDiff {
  stock: string;
  category: string;
  previous: number;
  aiOptimized: number;
  changeType: AllocationChangeType;
  delta: number; // aiOptimized - previous
}

function toChartValues(
  recommendation: RecommendationResponse,
): ChartProps["values"] {
  const tickers = new Set([
    ...Object.keys(recommendation.current_weights),
    ...Object.keys(recommendation.projected_weights),
  ]);

  return [...tickers].map((ticker) => ({
    category:
      STOCK_META[ticker as keyof typeof STOCK_META]?.category ?? "Unknown",
    stock: ticker,
    value: {
      previous: Number(
        ((recommendation.current_weights[ticker] ?? 0) * 100).toFixed(1),
      ),
      aiOptimized: Number(
        ((recommendation.projected_weights[ticker] ?? 0) * 100).toFixed(1),
      ),
    },
  }));
}

function toAllocationDiff(
  recommendation: RecommendationResponse,
): AllocationDiff[] {
  const tickers = new Set([
    ...Object.keys(recommendation.current_weights),
    ...Object.keys(recommendation.projected_weights),
  ]);

  return [...tickers].map((ticker) => {
    const previousRaw = recommendation.current_weights[ticker] ?? 0;
    const nextRaw = recommendation.projected_weights[ticker] ?? 0;

    const previous = previousRaw * 100;
    const aiOptimized = nextRaw * 100;

    let changeType: AllocationChangeType;

    if (previousRaw === 0 && nextRaw > 0) {
      changeType = "NEW";
    } else if (Math.abs(previous - aiOptimized) < 1e-9) {
      changeType = "HOLD";
    } else if (nextRaw > previousRaw) {
      changeType = "INCREASE";
    } else {
      changeType = "DECREASE";
    }

    return {
      stock: ticker,
      category:
        STOCK_META[ticker as keyof typeof STOCK_META]?.category ?? "Unknown",
      previous,
      aiOptimized,
      changeType,
      delta: aiOptimized - previous,
    };
  });
}

const OnBoardingMlRecommendationMainComponent = ({
  isDashboard = true,
  data,
}: {
  isDashboard: boolean;
  data: RLRecommendation;
}) => {
  const rlInfo = data.payload as RecommendationResponse | undefined;

  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl my-12 px-4">
      <div className="flex justify-start sm:justify-between sm:items-center items-start sm:flex-row flex-col">
        <div className="flex flex-col gap-1">
          <div>
            <h2 className="text-primary font-semibold uppercase text-sm">
              Machine learning analysis complete
            </h2>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recommendation Ready</h2>
          </div>
          <div>
            <p className="text-muted-foreground max-w-lg">
              Based on your risk profile, our AI Agent has identified these
              adjustements to optimize your portfolio for the next quarter
            </p>
          </div>
        </div>
        <Button>
          <Sparkles />
          Apply Recommendations
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 my-5 lg:my-8 gap-4">
        <div className="col-span-1 lg:col-span-3">
          <div className="flex flex-col gap-4">
            <Card className="">
              <CardContent>
                <div className="">
                  <div>
                    <div className="font-semibold text-lg my-2">
                      Portfolio Sector Allocation
                    </div>
                    <Stats13 values={toChartValues(rlInfo!)} />
                  </div>
                </div>
              </CardContent>
            </Card>
            {data.rationale && (
              <Card className="">
                <CardContent>
                  <div className="">
                    <div>
                      <div className="font-semibold text-lg my-2 flex gap-2 items-center">
                        <ThumbsUp />
                        <h1> Why this works: ML Rationale</h1>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {data.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
          <Card className="">
            <CardContent>
              <div className="">
                <div>
                  <div className="font-semibold text-lg my-2">
                    Strategic moves
                  </div>
                  <div className="flex flex-col gap-3">
                    {toAllocationDiff(rlInfo!).map((el, index) => {
                      return <StrategicMove key={index} allocationDiff={el} />;
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {rlInfo?.transaction_costs && (
            <Card className="">
              <CardContent>
                <div className="">
                  <div className="uppercase text-sm font-semibold">
                    Total Transaction cost summary
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <TransactionCost
                      title="Brokerage Fees"
                      value={
                        rlInfo?.transaction_costs.brokerage_kes.toFixed(2) ??
                        "0"
                      }
                    />
                    <TransactionCost
                      title="NSE Levy"
                      value={
                        rlInfo?.transaction_costs.nse_levy_kes.toFixed(2) ?? "0"
                      }
                    />
                    <TransactionCost
                      title="CMA Levy"
                      value={
                        rlInfo?.transaction_costs.cma_levy_kes.toFixed(2) ?? "0"
                      }
                    />
                    <TransactionCost
                      title="CDSC Levy"
                      value={
                        rlInfo?.transaction_costs.cdsc_levy_kes.toFixed(2) ??
                        "0"
                      }
                    />
                    <div className="border-t flex justify-between pt-2">
                      <div className="text-sm font-bold">
                        Total Estimated Cost
                      </div>
                      <div className="font-bold text-primary">
                        KES
                        {rlInfo?.transaction_costs.total_kes.toFixed(2) ?? "0"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground italic text-xs">
                  This is the sum total of costs that will be inccured if this
                  recommendation is executed
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      {!isDashboard && (
        <Button asChild>
          <Link href={"/dashboard"} className="flex gap-2 items-center">
            Proceed to dashboard <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  );
};

const TransactionCost = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div className="flex justify-between gap-1">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xs font-semibold">KES{value}</div>
    </div>
  );
};

const StrategicMove = ({
  allocationDiff,
}: {
  allocationDiff: AllocationDiff;
}) => {
  let isSuccess;
  let TrendIcon;
  let ArrowIcon;
  let labelText;
  let signal;
  switch (allocationDiff.changeType) {
    case "DECREASE":
      TrendIcon = TrendingDown;
      ArrowIcon = ArrowDown;
      labelText = "Reduce exposure to";
      signal = "Strong sell signal";
      isSuccess = false;
      break;
    case "HOLD":
      TrendIcon = Lock;
      ArrowIcon = ArrowUp;
      labelText = "Hold";
      signal = "Strong hold signal";
      isSuccess = true;

      break;
    case "NEW":
      TrendIcon = CirclePlus;
      ArrowIcon = ArrowUp;
      labelText = "Add a new investment in";
      signal = "Strong buy signal";
      isSuccess = true;
      break;
    case "INCREASE":
      TrendIcon = TrendingUp;
      ArrowIcon = ArrowUp;
      labelText = "Increase weight in";
      signal = "Strong buy signal";
      isSuccess = true;
      break;
  }
  return (
    <div
      className={`flex gap-3 bg-accent p-3 rounded-md border-l-4 ${isSuccess ? "border-green-800" : "border-destructive"}`}
    >
      <div>
        <TrendIcon
          className={`${isSuccess ? "text-green-800" : "text-destructive"}`}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="font-semibold">
          {labelText} {allocationDiff.stock}
        </h1>
        <p className="text-muted-foreground">
          Target: {allocationDiff.aiOptimized.toFixed(2)}% (Current:{" "}
          {allocationDiff.previous.toFixed(2)}%)
        </p>
        <div
          className={`flex gap-2 items-center ${isSuccess ? "text-green-800" : "text-destructive"}`}
        >
          <ArrowIcon size={18} /> <p>{signal}</p>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingMlRecommendationMainComponent;
