"use client";

import FeedbackHeader from "./feedback.header";
import { Field, FieldError, FieldLabel } from "@frontend/components/ui/field";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { apiClient } from "@/packages/clients/src";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@frontend/components/ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";

const FeedbackSchema = z.object({
  title: z.string().nonempty("Title is required"),
  feedback: z.string().nonempty("Feedback is required"),
});

type FeedbackFormFields = z.infer<typeof FeedbackSchema>;

const FeedbackMainComponent = () => {
  const methods = useForm<FeedbackFormFields>({
    defaultValues: {
      title: "",
      feedback: "",
    },
    resolver: zodResolver(FeedbackSchema),
  });

  const createApiKeySubmitted: SubmitHandler<FeedbackFormFields> = async (
    formData,
  ) => {
    const { title, feedback } = formData;
    try {
      await apiClient.api.feedback.post({
        title,
        feedback,
      });
      methods.reset();
      toast.success("Feedback submitted successfully", {
        className: "text-foreground",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      methods.setError("root", {
        message: "Something went wrong",
      });
      toast.error("Uh oh! Something went wrong.", {
        className: "text-foreground",
      });
    }
  };

  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl">
      {methods.formState.isSubmitting && (
        <BarLoaderFullScreenWidth loading={methods.formState.isSubmitting} />
      )}
      <FeedbackHeader />
      <div>
        <div className="max-w-xl mx-auto">
          <form onSubmit={methods.handleSubmit(createApiKeySubmitted)}>
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
      </div>
    </div>
  );
};

export default FeedbackMainComponent;
