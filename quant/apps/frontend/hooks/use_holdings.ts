import { apiClient } from "@/packages/clients/src";
import useSWR from "swr";

export const useHoldings = () => {
  const {
    data: holdings,
    error,
    isLoading,
  } = useSWR(`/holdings`, async () => {
    const { data } = await apiClient.api.holdings.get();
    if (!data) {
      throw new Error();
    }
    return data;
  });
  return {
    holdings,
    error,
    isLoading,
  };
};
