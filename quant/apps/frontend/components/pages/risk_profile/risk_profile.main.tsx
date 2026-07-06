"use client";

import { Badge } from "@frontend/components/ui/badge";
import { Button } from "@frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRiskProfile } from "@/apps/frontend/hooks/use_risk_profile";
import { Spinner } from "../../ui/spinner";
import { riskProfileMapping } from "@/apps/frontend/configs/risk_profile_mapping";

const RiskProfileMainComponent = () => {
  const { isLoading, riskProfile, error } = useRiskProfile();
  if (isLoading)
    return (
      <div className="my-3">
        <Spinner />
      </div>
    );
  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl my-12">
      <div className="flex flex-col gap-1">
        <div>
          <h2 className="text-2xl font-bold">Your Risk Profile</h2>
        </div>
        <div>
          <p className="text-muted-foreground max-w-lg">
            our AI advisor uses your risk tolerance to curate a portfolio that
            matches your financial resilience. This setting directly influences
            the asset allocation and stock selection in your recommendation
            strategy.
          </p>
        </div>
      </div>
      <div className="my-8">
        <Card className="@container/card max-w-md mx-auto w-full">
          {!error && riskProfile && (
            <CardHeader>
              <Badge variant="outline" className="uppercase">
                Current status
              </Badge>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {riskProfileMapping[riskProfile.category].title}
              </CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <div className="flex flex-col gap-3">
              {!error && riskProfile && (
                <p className="text-muted-foreground">
                  {riskProfileMapping[riskProfile.category].description}
                </p>
              )}
              <Button asChild>
                <Link href={"/dashboard/risk-profile/update"}>
                  <RefreshCcw />
                  Take Assessment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskProfileMainComponent;
