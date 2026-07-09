"use client";

import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@frontend/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@frontend/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@frontend/components/ui/field";
import { StarRating } from "react-flexible-star-rating";
// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const REASON_OPTIONS = [
  { value: "too_risky", label: "Too risky for my profile" },
  { value: "too_conservative", label: "Too conservative for my profile" },
  { value: "unclear", label: "Recommendation is unclear / not enough info" },
  { value: "trust", label: "I don't trust this stock/sector" },
  { value: "timing", label: "Timing seems off" },
  { value: "other", label: "Other" },
] as const;

const ACTION_OPTIONS = [
  { value: "followed", label: "Followed it fully" },
  { value: "partial", label: "Followed it partially" },
  { value: "ignored", label: "Did not act on it" },
] as const;

export const recommendationFeedbackSchema = z
  .object({
    rating: z.number().min(1, "Please rate this recommendation").max(5),
    reasonCategory: z.enum(
      REASON_OPTIONS.map((o) => o.value) as [string, ...string[]],
    ),
    reasonText: z.string().max(500).optional(),
    actionTaken: z.enum(
      ACTION_OPTIONS.map((o) => o.value) as [string, ...string[]],
    ),
    confidence: z.enum(["1", "2", "3", "4", "5"]),
    additionalComments: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.reasonCategory !== "other" ||
      (data.reasonText?.trim().length ?? 0) > 0,
    {
      message: "Please briefly describe your reason",
      path: ["reasonText"],
    },
  );

export type RecommendationFeedbackValues = z.infer<
  typeof recommendationFeedbackSchema
>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RecommendationFeedbackFormProps {
  recommendationId: string;
  onSubmit: (
    values: RecommendationFeedbackValues & { recommendationId: string },
  ) => Promise<void> | void;
}

export function RecommendationFeedbackForm({
  recommendationId,
  onSubmit,
}: RecommendationFeedbackFormProps) {
  const methods = useForm<RecommendationFeedbackValues>({
    resolver: zodResolver(recommendationFeedbackSchema),
    defaultValues: {
      rating: 0,
      reasonCategory: undefined,
      reasonText: "",
      actionTaken: undefined,
      confidence: undefined,
      additionalComments: "",
    },
  });

  const reasonCategory = methods.watch("reasonCategory");

  const handleSubmit = methods.handleSubmit(async (values) => {
    await onSubmit({ ...values, recommendationId });
    methods.reset();
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Rating */}
      <Controller
        name="rating"
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="my-4">
            <FieldLabel className="text-muted-foreground">
              How helpful was this recommendation?
            </FieldLabel>
            <StarRating
              dimension={15}
              initialRating={field.value}
              onRatingChange={(rating: number) => field.onChange(rating)}
            />
            <FieldDescription>
              1 = not helpful, 5 = very helpful
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Reason category */}
      <Controller
        name="reasonCategory"
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="my-4">
            <FieldLabel htmlFor={field.name} className="text-muted-foreground">
              Why have you provided the above rating?
            </FieldLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Reason free text (only when "other" selected) */}
      {reasonCategory === "other" && (
        <Controller
          name="reasonText"
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="my-4">
              <FieldLabel
                htmlFor={field.name}
                className="text-muted-foreground"
              >
                Tell us more
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Enter rating reason"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      {/* Action taken */}
      <Controller
        name="actionTaken"
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="my-4">
            <FieldLabel className="text-muted-foreground">
              What did you do with this recommendation?
            </FieldLabel>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col gap-2"
              aria-invalid={fieldState.invalid}
            >
              {ACTION_OPTIONS.map((option) => (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  className="gap-2"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`action-${option.value}`}
                  />
                  <FieldLabel
                    htmlFor={`action-${option.value}`}
                    className="font-normal"
                  >
                    {option.label}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Confidence */}
      <Controller
        name="confidence"
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="my-4">
            <FieldLabel htmlFor={field.name} className="text-muted-foreground">
              How confident do you feel about this recommendation?
            </FieldLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select confidence level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Not confident at all</SelectItem>
                <SelectItem value="2">2 - Slightly confident</SelectItem>
                <SelectItem value="3">3 - Moderately confident</SelectItem>
                <SelectItem value="4">4 - Confident</SelectItem>
                <SelectItem value="5">5 - Very confident</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Additional comments (optional, low-weight qualitative signal) */}
      <Controller
        name="additionalComments"
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="my-4">
            <FieldLabel htmlFor={field.name} className="text-muted-foreground">
              Anything else you&apos;d like to add? (optional)
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Additional comments"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        type="submit"
        disabled={methods.formState.isSubmitting}
        className="w-full"
      >
        {methods.formState.isSubmitting ? "Submitting..." : "Submit feedback"}
      </Button>
    </form>
  );
}
