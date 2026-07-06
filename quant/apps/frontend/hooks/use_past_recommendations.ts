import { apiClient } from "@/packages/clients/src";
import useSWR from "swr";

export const usePastRecommendations = () => {
  const {
    data: recommendations,
    error,
    isLoading,
  } = useSWR(`/recommendations`, async () => {
    const { data } = await apiClient.api.recommendations.get();
    if (!data) {
      throw new Error();
    }
    return data;
  });
  return {
    recommendations,
    error,
    isLoading,
  };
};
