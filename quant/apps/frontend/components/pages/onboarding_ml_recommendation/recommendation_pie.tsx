"use client";

import { cn } from "@frontend/lib/utils";

export interface ChartProps {
  values: {
    category: string;
    stock: string;
    value: {
      previous: number;
      aiOptimized: number;
    };
  }[];
}

export default function Stats13({ values }: ChartProps) {
  const aiOptimizedColor = "bg-purple-500";
  const previousColor = "bg-amber-500";

  return (
    <div>
      {values.map((segment, index) => {
        const previousVal = segment.value.previous;
        const aiOptimizedVal = segment.value.aiOptimized;
        const totalValue = 100;
        let firstVal;
        let secondVal;
        let firstValIsAiOptimized;

        if (previousVal > aiOptimizedVal) {
          firstVal = aiOptimizedVal;
          firstValIsAiOptimized = true;
          secondVal = previousVal - aiOptimizedVal;
        } else {
          firstVal = previousVal;
          firstValIsAiOptimized = false;
          secondVal = aiOptimizedVal - previousVal;
        }
        const firstPercentage = (firstVal / totalValue) * 100;
        const secondPercentage = (secondVal / totalValue) * 100;

        return (
          <div key={index}>
            <div className="flex justify-between mb-1.5">
              <p className="font-semibold text-xs">
                {segment.category} ({segment.stock})
              </p>
              <p className="text-xs">
                <span className="text-primary font-semibold">
                  {segment.value.aiOptimized}%
                </span>{" "}
                <span className="text-muted-foreground">
                  (vs {segment.value.previous}%)
                </span>
              </p>
            </div>
            <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full",
                  firstValIsAiOptimized ? aiOptimizedColor : previousColor,
                )}
                style={{ width: `${firstPercentage}%` }}
                role="progressbar"
                aria-label={segment.category}
                aria-valuenow={firstVal}
                aria-valuemin={0}
                aria-valuemax={totalValue}
              />
              <div
                className={cn(
                  "h-full",
                  !firstValIsAiOptimized ? aiOptimizedColor : previousColor,
                )}
                style={{ width: `${secondPercentage}%` }}
                role="progressbar"
                aria-label={segment.category}
                aria-valuenow={secondVal}
                aria-valuemin={0}
                aria-valuemax={totalValue}
              />
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-3 shrink-0 rounded", previousColor)}
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn("size-3 shrink-0 rounded", aiOptimizedColor)}
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            AI Optimized Suggestion
          </span>
        </div>
      </div>
    </div>
  );
}
