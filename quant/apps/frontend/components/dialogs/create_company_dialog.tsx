"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@frontend/components/ui/dialog";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Field, FieldError, FieldLabel } from "@frontend/components/ui/field";
import z from "zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { apiClient } from "@/packages/clients/src";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { Input } from "@frontend/components/ui/input";
import { Button } from "@frontend/components/ui/button";
import type { Company } from "@/apps/coordinator/src/models/resources";
import { parseUndefinedString } from "../../utils/parse_undefined_string";
import { TickersSchema } from "@/apps/coordinator/src/models/commands/companies/create_company_command";

const CreateCompanySchema = z.object({
  name: z.string().nonempty("Company name is required"),
  ticker: z.string().nonempty("Company ticker is required"),
  logoUrl: z.string(),
});

type CreateCompanyFormFields = z.infer<typeof CreateCompanySchema>;

export const ShowCreateCompanyiDialog = ({
  setShowDialog,
  showDialog,
  company,
}: {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  company?: Company;
}) => {
  const router = useRouter();
  const isCompanyEdit = !!company;
  const [, startTransition] = useTransition();

  const methods = useForm<CreateCompanyFormFields>({
    defaultValues: {
      ticker: company?.ticker ?? "",
      logoUrl: company?.logoUrl ?? "",
      name: company?.name ?? "",
    },
    resolver: zodResolver(CreateCompanySchema),
  });

  const signUpSubmitted: SubmitHandler<CreateCompanyFormFields> = async (
    formData,
  ) => {
    try {
      if (isCompanyEdit) {
        //
        startTransition(() => {
          router.refresh();
        });
      } else {
        const ticker = TickersSchema.safeParse(formData.ticker);
        if (!ticker.success) {
          toast.error(
            "Provided company ticker is unknown, please review allowed tickers and try again",
            {
              className: "text-foreground",
            },
          );
          return;
        }
        const { error } = await apiClient.api.companies.post({
          name: formData.name,
          ticker: ticker.data,
          logoUrl: parseUndefinedString(formData.logoUrl),
        });
        if (error) {
          methods.setError("root", {
            message: "Something went wrong",
          });
          toast.error("Uh oh! Something went wrong.", {
            className: "text-foreground",
          });
          return;
        } else {
          startTransition(() => {
            router.refresh();
          });
          setShowDialog(false);
          toast.success("Company added successfully", {
            className: "text-foreground",
          });
        }
      }
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
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="sm:max-w-106.25 overflow-y-auto max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="">
            {isCompanyEdit ? "Edit Company" : "Add Company"}
          </DialogTitle>
        </DialogHeader>

        <div>
          {methods.formState.isSubmitting && (
            <BarLoaderFullScreenWidth
              loading={methods.formState.isSubmitting}
            />
          )}
          <form onSubmit={methods.handleSubmit(signUpSubmitted)}>
            <div className="flex flex-col">
              <Controller
                name="name"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="my-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-muted-foreground"
                    >
                      Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter company name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="ticker"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="my-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-muted-foreground"
                    >
                      Ticker
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter ticker"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="logoUrl"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="my-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-muted-foreground"
                    >
                      Logo Url
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter logo url"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="flex my-3">
              <Button type="submit" className="w-full">
                {isCompanyEdit ? "Edit company" : "Add company"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const useCreateCompanyiDialog = () => {
  const [showDialog, setShowDialog] = useState(false);

  const CreateCompanyDialog = () => (
    <ShowCreateCompanyiDialog
      showDialog={showDialog}
      setShowDialog={setShowDialog}
    />
  );

  const setCreateCompanyDialog = (show: boolean) => {
    setShowDialog(show);
  };

  return {
    setCreateCompanyDialog,
    CreateCompanyDialog,
  };
};
