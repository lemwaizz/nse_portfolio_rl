"use client";

import FeedbackHeader from "./feedback.header";
import { toast } from "sonner";
import { apiClient } from "@/packages/clients/src";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";
import { RecommendationFeedbackForm } from "./recommendation_form";
import { useState } from "react";

const FeedbackMainComponent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl">
      {isSubmitting && <BarLoaderFullScreenWidth loading={isSubmitting} />}
      <FeedbackHeader />
      <div className="max-w-xl mx-auto">
        <RecommendationFeedbackForm
          onSubmit={async (value) => {
            try {
              setIsSubmitting(true);
              await apiClient.api.feedback.post({
                title: value.reasonCategory,
                feedback: value.actionTaken,
                response: value,
              });
              toast.success("Feedback submitted successfully", {
                className: "text-foreground",
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              toast.error("Uh oh! Something went wrong.", {
                className: "text-foreground",
              });
            } finally {
              setIsSubmitting(false);
            }
          }}
          recommendationId="id"
        />
      </div>
      {/* <div>
        <div className="max-w-xl mx-auto">
          <div>
            <div className="text-muted-foreground">
              What is your rating of this application?
            </div>
            <div className="flex gap-2 items-center justify-start">
              <StarRating onRatingChange={handleRatingChange} dimension={15} />
            </div>
          </div>

          <form onSubmit={methods.handleSubmit(createApiKeySubmitted)}>
            <Controller
              name="feedback"
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="my-4">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-muted-foreground"
                  >
                    Why have you provided the above rating?
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter rating reason"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            
            <Controller
              name="title"
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="my-4">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-muted-foreground"
                  >
                    Feedback Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter title"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="feedback"
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="my-4">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-muted-foreground"
                  >
                    Feedback content
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your feedback"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="flex my-3">
              <Button className="w-full" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div> */}
    </div>
  );
};

export default FeedbackMainComponent;
