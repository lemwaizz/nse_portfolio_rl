import { apiClient } from "@/packages/clients/src";
import useSWR from "swr";

export const useRiskProfile = () => {
  const {
    data: riskProfile,
    error,
    isLoading,
  } = useSWR(`/risk-profile`, async () => {
    const { data } = await apiClient.api["risk-profile"].get();
    if (!data) {
      throw new Error();
    }
    return data;
  });
  return {
    riskProfile,
    error,
    isLoading,
  };
};
