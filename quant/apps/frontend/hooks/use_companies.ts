import { apiClient } from "@/packages/clients/src";
import useSWR from "swr";

export const useCompanies = () => {
  const {
    data: companies,
    error,
    isLoading,
  } = useSWR(`/companies`, async () => {
    const { data } = await apiClient.api.companies.get();
    if (!data) {
      throw new Error();
    }
    return data;
  });
  return {
    companies,
    error,
    isLoading,
  };
};
