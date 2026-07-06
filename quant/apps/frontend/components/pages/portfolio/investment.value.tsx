"use client";
import { useCurrentMarkedValue } from "@/apps/frontend/hooks/use_current_market_value";
import { Badge } from "@frontend/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Spinner } from "../../ui/spinner";

const InvestmentValueCard = () => {
  const { isLoading, marketValue, error } = useCurrentMarkedValue();
  if (isLoading)
    return (
      <div className="my-3 flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (error || !marketValue)
    return (
      <div className="my-3 text-sm text-destructive">
        Failed to load market value.
      </div>
    );
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Investment Value</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          KES{marketValue.marketValue}
        </CardTitle>
        {/* <CardAction>
          <Badge variant="outline">
            <TrendingUp />
            +12.5%
          </Badge>
        </CardAction> */}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {/* <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <TrendingUp className="size-4" />
        </div> */}
        <div className="text-muted-foreground italic">
          This is the sum total of your initial investment
        </div>
      </CardFooter>
    </Card>
  );
};

export default InvestmentValueCard;
