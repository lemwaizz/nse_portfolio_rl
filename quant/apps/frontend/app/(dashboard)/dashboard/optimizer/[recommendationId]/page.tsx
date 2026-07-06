import OnBoardingMlRecommendationMainComponent from "@frontend/components/pages/onboarding_ml_recommendation/on_boarding_ml_recommendation.main";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { apiClient } from "@/packages/clients/src";

interface OptimizerPageProps {
  params: Promise<{ recommendationId: string }>;
}

const OptimizerPage = async (props: OptimizerPageProps) => {
  const recommendationId = (await props.params).recommendationId;
  const reqHeaders = await headers();
  const { data, error } = await apiClient.api
    .recommendations({ id: recommendationId })
    .get({
      headers: reqHeaders,
    });
  if (error) notFound();
  return (
    <OnBoardingMlRecommendationMainComponent isDashboard={true} data={data} />
  );
};

export default OptimizerPage;
