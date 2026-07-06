import { apiClient } from "@/packages/clients/src";
import useSWR from "swr";

export const useCurrentMarkedValue = () => {
  const {
    data: marketValue,
    error,
    isLoading,
  } = useSWR(`/current-market-value`, async () => {
    const { data } = await apiClient.api.holdings.value.get();
    if (!data) {
      throw new Error();
    }
    return data;
  });
  return {
    marketValue,
    error,
    isLoading,
  };
};
