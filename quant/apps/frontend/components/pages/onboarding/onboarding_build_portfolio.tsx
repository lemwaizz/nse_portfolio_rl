"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@frontend/components/ui/select";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  type SubmitHandler,
} from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@frontend/components/ui/field";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@frontend/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@frontend/components/ui/avatar";
import { ArrowRight, FileChartLine, Plus, Trash } from "lucide-react";
import { Button } from "@frontend/components/ui/button";
import { useCompanies } from "@/apps/frontend/hooks/use_companies";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";
import { toast } from "sonner";
import { apiClient } from "@/packages/clients/src";
import { useSWRConfig } from "swr";
import { useHoldings } from "@/apps/frontend/hooks/use_holdings";
import { Spinner } from "../../ui/spinner";
import type { HoldingListResponse } from "@/apps/coordinator/src/models/resources";

export const BuildPortfolioContent = ({
  onNextPage,
}: {
  onNextPage: () => void;
}) => {
  const { holdings, error, isLoading } = useHoldings();

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
      <div className="col-span-1 lg:col-span-3">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="font-semibold tabular-nums">
              Add Current Holdings
            </CardTitle>
            <CardDescription>
              Input your existing Nairobi Securities Exchange stocks to begin
              your analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BuildPorfolioForm />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold tabular-nums">
              Review Portfolio
            </CardTitle>
            <CardDescription>
              Review your added holdings before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserAddedHoldings
              holdings={holdings}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                if ((holdings?.items.length ?? 0) <= 0) {
                  toast.error(
                    "Add some holdings to your portfolio to continue",
                    {
                      className: "text-foreground",
                    },
                  );
                  return;
                }
                onNextPage();
              }}
            >
              Confirm & Continue
              <ArrowRight />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const UserAddedHoldings = ({
  holdings,
  error,
  isLoading,
}: {
  holdings?: HoldingListResponse;
  error: unknown;
  isLoading: boolean;
}) => {
  // const { holdings, error, isLoading } = useHoldings();
  if (isLoading)
    return (
      <div className="my-3">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="my-3 text-sm text-destructive">
        Failed to load holdings.
      </div>
    );
  if (!holdings || holdings.items.length === 0) {
    return (
      <div className="my-3 text-sm text-muted-foreground">
        No holdings added yet.
      </div>
    );
  }
  const visibleHoldings = holdings.items.slice(0, 5);
  const remainingCount = holdings.items.length - visibleHoldings.length;
  return (
    <div className="flex flex-col gap-4">
      {visibleHoldings.map((holding) => (
        <SinglePortfolioHoldingTile key={holding.id} holding={holding} />
      ))}
      {remainingCount > 0 && (
        <div className="text-sm text-muted-foreground">
          +{remainingCount} more holding{remainingCount > 1 ? "s" : ""} not
          shown
        </div>
      )}
    </div>
  );
};

const AddHoldingSchema = z.object({
  companyId: z.string().nonempty("Company name is required"),
  numberOfShares: z.number().min(1),
  averageSharePrice: z.number().min(1),
});

type AddHoldingFormFields = z.infer<typeof AddHoldingSchema>;

export const useAddHoldingFieldForm = () =>
  useFormContext<AddHoldingFormFields>();

const BuildPorfolioForm = () => {
  const { mutate } = useSWRConfig();
  const methods = useForm<AddHoldingFormFields>({
    defaultValues: {
      companyId: "",
      numberOfShares: 0,
      averageSharePrice: 0,
    },
    resolver: zodResolver(AddHoldingSchema),
  });

  const createApiKeySubmitted: SubmitHandler<AddHoldingFormFields> = async (
    formData,
  ) => {
    const { averageSharePrice, companyId, numberOfShares } = formData;
    try {
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

      mutate("/holdings");
      toast.success("Domain added successfully", {
        className: "text-foreground",
      });
      methods.reset();

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
    <div>
      {methods.formState.isSubmitting && (
        <BarLoaderFullScreenWidth loading={methods.formState.isSubmitting} />
      )}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(createApiKeySubmitted)}>
          <CompanySelection />
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
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter shares"
                    autoComplete="off"
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : Number(val));
                    }}
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
                    placeholder="Enter average price"
                    autoComplete="off"
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : Number(val));
                    }}
                    value={field.value ?? ""}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Button variant={"default"}>
            <Plus />
            Add Portfolio
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

const CompanySelection = () => {
  const methods = useAddHoldingFieldForm();
  const { companies } = useCompanies();

  return (
    <div>
      <Controller
        name="companyId"
        control={methods.control}
        render={({ field, fieldState }) => {
          const selectedFamily = companies?.items.find(
            (f) => f.id === field.value,
          );
          return (
            <Field
              orientation="responsive"
              data-invalid={fieldState.invalid}
              className="my-4"
            >
              <FieldLabel htmlFor={field.name}>Company</FieldLabel>
              <Select
                disabled={false}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="form-rhf-select-language"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue
                    placeholder={
                      selectedFamily ? selectedFamily.name : "Select"
                    }
                  />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectGroup>
                    {companies && (
                      <SelectLabel className="font-mono">Companies</SelectLabel>
                    )}
                    {!companies && (
                      <SelectLabel className="font-mono">
                        Available companies will show up here
                      </SelectLabel>
                    )}
                    {companies &&
                      companies.items.length > 0 &&
                      companies.items.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex gap-2 items-center">
                            <div className=" font-bold">{customer.name}</div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
                <FieldDescription>
                  The company whose shares you own.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError
                    errors={[fieldState.error]}
                    className="break-all"
                  />
                )}
              </Select>
            </Field>
          );
        }}
      />
    </div>
  );
};

const SinglePortfolioHoldingTile = ({
  holding,
}: {
  holding: HoldingListResponse["items"][0];
}) => {
  const { mutate } = useSWRConfig();

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center">
        <div>
          <Avatar className="h-8 w-8 rounded-lg">
            {holding.company.logoUrl && (
              <AvatarImage
                src={holding.company.logoUrl}
                alt={holding.company.name}
              />
            )}
            <AvatarFallback className="rounded-lg">
              <FileChartLine
                className="text-muted-foreground"
                strokeWidth={1.5}
                size={16}
              />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <div className="font-semibold">{holding.company.name}</div>
          <div className="text-muted-foreground text-xs">
            {holding.shares} shares # KES {holding.averageSharePrice}
          </div>
          <div className="text-primary font-semibold">
            TOTAL: Kes {holding.shares * holding.averageSharePrice}
          </div>
        </div>
      </div>
      <div className="">
        <Button
          variant="outline"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 hover:text-foreground text-muted-foreground`}
          onClick={async () => {
            try {
              const { error } = await apiClient.api
                .holdings({ id: holding.id })
                .delete();
              if (error) {
                return;
              }
              mutate("/holdings");
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <div>
            <Trash className="h-5 w-5 text-destructive" />
            <span className="sr-only">Delete</span>
          </div>
        </Button>
      </div>
    </div>
  );
};
