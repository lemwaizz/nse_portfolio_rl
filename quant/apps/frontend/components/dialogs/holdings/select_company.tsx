import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@frontend/components/ui/select";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@frontend/components/ui/field";
import { useAddHoldingFieldForm } from "./add_holding_dialog";
import { useCompanies } from "@/apps/frontend/hooks/use_companies";

export const CompanySelection = ({ isEdit }: { isEdit: boolean }) => {
  const { control } = useAddHoldingFieldForm();
  const { companies } = useCompanies();
  return (
    <div>
      <Controller
        name="companyId"
        control={control}
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
                disabled={isEdit}
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
