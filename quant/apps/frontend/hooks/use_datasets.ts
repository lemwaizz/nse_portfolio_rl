import { apiClient } from "@/packages/clients/src";
import useSWR from "swr";

export const useDatasets = () => {
  const {
    data: datasets,
    error,
    isLoading,
  } = useSWR(`/dataset`, async () => {
    const { data } = await apiClient.api.dataset.get();
    if (!data) {
      throw new Error();
    }
    return data;
  });
  return {
    datasets,
    error,
    isLoading,
  };
};
