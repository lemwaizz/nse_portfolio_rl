"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@frontend/components/ui/dialog";
import { Input } from "@frontend/components/ui/input";
import { Button } from "@frontend/components/ui/button";
import {
  Controller,
  FormProvider,
  type SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";
import { Field, FieldError, FieldLabel } from "@frontend/components/ui/field";
import z from "zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CompanySelection } from "./select_company";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import { apiClient } from "@/packages/clients/src";
import type { Holding } from "@coordinator/models/resources";

const AddHoldingSchema = z.object({
  companyId: z.string().nonempty("Company name is required"),
  numberOfShares: z.number().min(1),
  averageSharePrice: z.number().min(1),
});

type AddHoldingFormFields = z.infer<typeof AddHoldingSchema>;

export const ShowModifyHoldingDialog = ({
  setShowDialog,
  showDialog,
  holding,
}: {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  holding?: Holding;
}) => {
  const isHoldingEdit = !!holding;
  const [, startTransition] = useTransition();
  const router = useRouter();

  const methods = useForm<AddHoldingFormFields>({
    defaultValues: {
      companyId: holding?.company?.id ?? "",
      numberOfShares: holding?.shares ?? 0,
      averageSharePrice: holding?.averageSharePrice ?? 0,
    },
    resolver: zodResolver(AddHoldingSchema),
  });

  const createApiKeySubmitted: SubmitHandler<AddHoldingFormFields> = async (
    formData,
  ) => {
    const { averageSharePrice, companyId, numberOfShares } = formData;
    try {
      if (isHoldingEdit) {
        const { error } = await apiClient.api
          .holdings({ id: holding!.id })
          .patch({
            companyId: companyId,
            averageSharePrice: averageSharePrice,
            shares: numberOfShares,
          });
        if (error) {
          methods.setError("root", {
            message: "Something went wrong",
          });
          toast.error("Uh oh! Something went wrong.", {
            className: "text-foreground",
          });
          return;
        }
      } else {
        const { error } = await apiClient.api.holdings.post({
          companyId: companyId,
          averageSharePrice: averageSharePrice,
          shares: numberOfShares,
        });

        if (error) {
          methods.setError("root", {
            message: "Something went wrong",
          });
          toast.error("Uh oh! Something went wrong.", {
            className: "text-foreground",
          });
          return;
        }
      }
      startTransition(() => {
        router.refresh();
      });
      setShowDialog(false);
      toast.success("Domain added successfully", {
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

  const numberOfShares = methods.watch("numberOfShares");
  const averageSharePrice = methods.watch("averageSharePrice");

  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="sm:max-w-106.25 overflow-y-auto max-h-[95vh]">
        {methods.formState.isSubmitting && (
          <BarLoaderFullScreenWidth loading={methods.formState.isSubmitting} />
        )}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(createApiKeySubmitted)}>
            <DialogHeader>
              <DialogTitle className="">
                {isHoldingEdit ? "Edit Holding" : "Add New Holding"}
              </DialogTitle>
            </DialogHeader>
            <div>
              <CompanySelection isEdit={false} />
              <div className="flex gap-4">
                <Controller
                  name="numberOfShares"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="my-4">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-muted-foreground"
                      >
                        Number Of Shares
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter number of shares"
                        autoComplete="off"
                        value={field.value ?? ""}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="averageSharePrice"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="my-4">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-muted-foreground"
                      >
                        Avg Purchase Price (KES)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter domain"
                        autoComplete="off"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="mb-4">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Holding Value</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      KES
                      {Number.isNaN(numberOfShares * averageSharePrice)
                        ? 0
                        : numberOfShares * averageSharePrice}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="">
                Continue
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export const useAddHoldingFieldForm = () =>
  useFormContext<AddHoldingFormFields>();

export const useModifyHoldingDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [holding, setHolding] = useState<Holding | undefined>();

  const ModifyHoldingDialog = () => (
    <ShowModifyHoldingDialog
      showDialog={showDialog}
      setShowDialog={setShowDialog}
      holding={holding}
    />
  );

  const setModifyHoldingDialog = (show: boolean, holding?: Holding) => {
    setShowDialog(show);
    setHolding(holding);
  };

  return {
    setModifyHoldingDialog,
    ModifyHoldingDialog,
  };
};
