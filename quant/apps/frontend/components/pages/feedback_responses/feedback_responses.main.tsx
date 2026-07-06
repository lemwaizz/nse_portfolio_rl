import FeedbackResponsesHeader from "./feedback_responses.header";
import { notFound } from "next/navigation";
import { apiClient } from "@/packages/clients/src";
import { headers } from "next/headers";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@frontend/components/ui/empty";
import { ThumbsUp } from "lucide-react";
import type { FeedbackListResponse } from "@/apps/coordinator/src/models/resources";

const FeedbackResponsesMainComponent = async () => {
  const reqHeaders = await headers();
  const { data, error } = await apiClient.api.feedback.get({
    headers: reqHeaders,
  });
  if (error) notFound();
  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl">
      <FeedbackResponsesHeader />
      {data && data.items.length <= 0 && (
        <div className="container mx-auto py-5 lg:py-10">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ThumbsUp />
              </EmptyMedia>
              <EmptyTitle>No Feedback Yet</EmptyTitle>
              <EmptyDescription>
                Users haven&apos;t left any feedback yet. Maybe consider
                checking later.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
      {data && data.items.length > 0 && (
        <div className="flex flex-col gap-3 max-w-xl mx-auto my-5">
          {data.items.map((it, index) => {
            return (
              <FeedbackTile
                key={index}
                feedback={it}
                isLast={index === data.items.length - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const FeedbackTile = ({
  feedback,
  isLast,
}: {
  feedback: FeedbackListResponse["items"][0];
  isLast: boolean;
}) => {
  return (
    <div className={`${!isLast ? "border-b" : ""}`}>
      <div>
        <p className="font-bold">
          <span>Author: </span> {feedback.createdBy.name}
        </p>
      </div>

      <p className={`font-bold`}>
        <span>Title: </span> {feedback.title}
      </p>
      <p className="text-muted-foreground px-3">{feedback.feedback}</p>
    </div>
  );
};

export default FeedbackResponsesMainComponent;
