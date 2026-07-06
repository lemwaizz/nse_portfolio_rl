import { Button } from "@frontend/components/ui/button";
import InvestmentValueCard from "./investment.value";
import PastMarketInsightsAndMLRecommendations from "./past_market_insights.ml_recommendations";
import { PortfolioHeader } from "./portfolio.header";
import HoldingsTable from "./portfolio.holdings/holdings.table.main";
import { MoveUpRight, Sparkle, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import GenerateMLRecommendationsButton from "./generate_ml_recommendations_button";

const PortfolioMainComponent = () => {
  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl">
      <PortfolioHeader />
      <div className="grid lg:grid-cols-5 grid-cols-1 w-full gap-8">
        <div className="lg:col-span-3 col-span-1">
          <HoldingsTable />
        </div>
        <div className="lg:col-span-2 col-span-1">
          <div className="py-5 md:py-10">
            <InvestmentValueCard />
            <div className="my-4">
              <div>
                <Card className="@container/card bg-primary">
                  <CardHeader>
                    <div className="flex flex-row gap-2 text-primary-foreground">
                      <Sparkles /> ML Insights
                    </div>
                    <CardTitle className="font-semibold tabular-nums text-lg text-primary-foreground">
                      Portfolio Optimizer
                    </CardTitle>
                    <CardDescription className="text-primary-foreground">
                      Our ML model has analyzed over 10,000 data points across
                      the Nairobi Sercurities Exchange to refine your risk
                      adjusted returns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GenerateMLRecommendationsButton />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PastMarketInsightsAndMLRecommendations />
    </div>
  );
};

export default PortfolioMainComponent;
