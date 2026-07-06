"use client";
import { Button } from "../../ui/button";
import { apiClient } from "@/packages/clients/src";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Spinner } from "../../ui/spinner";

const GenerateMLRecommendationsButton = () => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  if (loading) return <Spinner />;

  return (
    <Button
      className=""
      variant={"secondary"}
      onClick={async () => {
        try {
          setLoading(true);
          const { data, error } = await apiClient.api.recommendations.post();
          if (error) {
            toast.error(
              "Uh oh! Something went wrong. You may not be having any holdings yet",
              {
                className: "text-foreground",
              },
            );
            return;
          }
          router.push(`/dashboard/optimizer/${data.id}`);
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false);
        }
      }}
    >
      Generate ML Insights
    </Button>
  );
};

export default GenerateMLRecommendationsButton;
