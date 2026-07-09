"use client";

import { FileChartLine, Sparkles } from "lucide-react";
import { Badge } from "@frontend/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@frontend/components/ui/avatar";
import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import { useHoldings } from "@/apps/frontend/hooks/use_holdings";
import { Spinner } from "../../ui/spinner";
import type { HoldingListResponse } from "@/apps/coordinator/src/models/resources";
import { useRiskProfile } from "@/apps/frontend/hooks/use_risk_profile";
import { riskProfileMapping } from "@/apps/frontend/configs/risk_profile_mapping";
import { useRouter } from "next/navigation";
import React from "react";
import { apiClient } from "@/packages/clients/src";
import { toast } from "sonner";

const OnboardingReadyToOptimize = ({}: { onNextPage: () => void }) => {
  const { holdings, error, isLoading } = useHoldings();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="font-bold text-2xl">Ready To Optimize</h2>
        <p className="text-center max-w-lg text-muted-foreground">
          We&apos;ve analyzed your inputs. Your profile is now synced with the
          Nairobi Securities Exchange marked data.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 my-3 gap-4">
        <RecommendedRiskProfile />
        <div className="col-span-1 lg:col-span-3">
          <Card className="@container/card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h2 className="text-primary font-bold">Portfolio Overview</h2>
                  <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-lg">
                    KES{" "}
                    {holdings?.items.reduce(
                      (sum, holding) =>
                        sum + holding.averageSharePrice * holding.shares,
                      0,
                    )}
                  </CardTitle>
                </div>
                <div className="text-sm text-muted-foreground font-semibold">
                  {holdings?.items.length ?? 0} Holdings
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <UserPortfolio
                isLoading={isLoading}
                holdings={holdings}
                error={error}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-4 lg:mt-8 flex items-center justify-center">
        {(holdings?.items.length ?? 0) > 0 && loading ? (
          <Spinner />
        ) : (
          <Button
            onClick={async () => {
              try {
                setLoading(true);
                const { data, error } =
                  await apiClient.api.recommendations.post();
                if (error) {
                  toast.error(
                    "Uh oh! Something went wrong. You may not be having any holdings yet",
                    {
                      className: "text-foreground",
                    },
                  );
                  return;
                }
                router.push(`/onboarding/recommendation/${data.id}`);
              } catch (e) {
                console.log(e);
              } finally {
                setLoading(false);
              }
            }}
          >
            Geneate ML Recommendation
          </Button>
        )}
        {(holdings?.items.length ?? 0) <= 0 && (
          <Button asChild>
            <Link
              href={
                (holdings?.items.length ?? 0) > 0
                  ? `/onboarding/recommendation`
                  : "/dashboard"
              }
              className="flex items-center"
            >
              {(holdings?.items.length ?? 0) > 0 && <Sparkles />}
              {(holdings?.items.length ?? 0) > 0
                ? `Generate ML Recommandation`
                : "Proceed to dashboard"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

const RecommendedRiskProfile = () => {
  const { isLoading, riskProfile, error } = useRiskProfile();
  if (isLoading)
    return (
      <div className="my-3">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="my-3 text-sm text-destructive">
        Failed to load risk profile.
      </div>
    );
  if (!riskProfile) {
    return (
      <div className="my-3 text-sm text-muted-foreground">
        No risk profile added yet.
      </div>
    );
  }
  return (
    <div className="col-span-1 lg:col-span-2">
      <Card className="@container/card">
        <CardHeader>
          <div className="flex">
            <Badge variant="default">Recommended Risk Profile</Badge>
          </div>
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-lg">
            {riskProfileMapping[riskProfile.category].title}
          </CardTitle>
          <CardDescription>
            {riskProfileMapping[riskProfile.category].description}
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
};

const UserPortfolio = ({
  isLoading,
  error,
  holdings,
}: {
  holdings?: HoldingListResponse;
  isLoading: boolean;
  error: unknown;
}) => {
  if (isLoading)
    return (
      <div className="my-3">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="my-3 text-sm text-destructive">
        Failed to load holdings.
      </div>
    );
  if (!holdings || holdings.items.length === 0) {
    return (
      <div className="my-3 text-sm text-muted-foreground">
        No holdings added yet.
      </div>
    );
  }
  const visibleHoldings = holdings.items.slice(0, 5);
  const remainingCount = holdings.items.length - visibleHoldings.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visibleHoldings.map((holding) => (
        <HoldingBadge key={holding.id} holding={holding} />
      ))}
      {remainingCount > 0 && (
        <div className="text-sm text-muted-foreground">
          +{remainingCount} more holding{remainingCount > 1 ? "s" : ""} not
          shown
        </div>
      )}
    </div>
  );
};

const HoldingBadge = ({
  holding,
}: {
  holding: HoldingListResponse["items"][0];
}) => {
  return (
    <div className="flex gap-2 items-center rounded-full px-4 py-2 bg-secondary">
      <Avatar className="h-8 w-8 rounded-lg">
        {holding.company.logoUrl && (
          <AvatarImage
            src={holding.company.logoUrl}
            alt={holding.company.name}
          />
        )}
        <AvatarFallback className="rounded-lg">
          <FileChartLine
            className="text-muted-foreground"
            strokeWidth={1.5}
            size={16}
          />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="font-semibold text-sm">{holding.company.ticker}</p>
        <p className="text-muted-foreground text-xs">{holding.company.name}</p>
      </div>
    </div>
  );
};

export default OnboardingReadyToOptimize;
