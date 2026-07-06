"use client";

import { ThumbsUp } from "lucide-react";
import { Badge } from "@frontend/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import { usePastRecommendations } from "@/apps/frontend/hooks/use_past_recommendations";
import type {
  RecommendationResponse,
  RLRecommendationListResponse,
} from "@/apps/coordinator/src/models/resources";
import { formatDateString } from "@/apps/frontend/utils/format_date";

const PastMarketInsightsAndMLRecommendations = () => {
  const { recommendations } = usePastRecommendations();
  const shownRecommendations = recommendations?.items
    .filter((rec) => !!rec.rationale)
    .slice(0, 3);
  if (shownRecommendations && shownRecommendations.length > 0) {
    return (
      <div>
        <div>
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            <ThumbsUp className="size-4" /> Past market insights & ML
            Recommendations
          </div>
        </div>
        <div className="my-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {shownRecommendations.map((rec, index) => {
            return <PastMarkedInsightCard key={index} recommendation={rec} />;
          })}
        </div>
      </div>
    );
  }
  return <></>;
};

const PastMarkedInsightCard = ({
  recommendation,
}: {
  recommendation: RLRecommendationListResponse["items"][0];
}) => {
  const rlResponse = recommendation.payload as RecommendationResponse;
  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex justify-between">
          <Badge variant="secondary">{rlResponse.risk_profile}</Badge>
          <div className="text-sm text-muted-foreground">
            {formatDateString(recommendation.createdAt)}
          </div>
        </div>
        <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-lg">
          {rlResponse.action_type} {rlResponse.ticker}
        </CardTitle>
        <CardDescription>{recommendation.rationale}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};

export default PastMarketInsightsAndMLRecommendations;
