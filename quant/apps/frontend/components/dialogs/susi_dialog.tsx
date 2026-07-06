"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@frontend/components/ui/dialog";
import { Input } from "@frontend/components/ui/input";
import { Button } from "@frontend/components/ui/button";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";
import { Field, FieldError, FieldLabel } from "@frontend/components/ui/field";
import z from "zod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@frontend/components/ui/tabs";
import { authClient } from "@/packages/clients/src";
import { useRouter } from "next/navigation";

export const ShowSusiDialog = ({
  setShowDialog,
  showDialog,
}: {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="sm:max-w-106.25 overflow-y-auto max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="">Sign In</DialogTitle>
        </DialogHeader>

        <div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signUp">SignUp</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signUp">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LoginSchema = z.object({
  email: z.string().nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

type LoginFormFields = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const methods = useForm<LoginFormFields>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(LoginSchema),
  });
  const router = useRouter();
  const createApiKeySubmitted: SubmitHandler<LoginFormFields> = async (
    formData,
  ) => {
    const { email, password } = formData;
    try {
      await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
        // callbackURL: "/dashboard",
      });
      router.push("/dashboard");

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
    <>
      {methods.formState.isSubmitting && (
        <BarLoaderFullScreenWidth loading={methods.formState.isSubmitting} />
      )}
      <form onSubmit={methods.handleSubmit(createApiKeySubmitted)}>
        <div className="flex flex-col">
          <Controller
            name="email"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="my-2">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-muted-foreground"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter email"
                  autoComplete="off"
                  type="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="my-2">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-muted-foreground"
                >
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter password"
                  autoComplete="off"
                  type="password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <div className="flex my-3">
          <Button className="w-full" type="submit">
            Login
          </Button>
        </div>
      </form>
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-muted-foreground/30" />
        <span className="text-sm font-medium text-muted-foreground">OR</span>
        <hr className="flex-1 border-muted-foreground/30" />
      </div>
      <div className="flex my-3">
        <Button
          className="w-full"
          variant={"outline"}
          onClick={async () => {
            try {
              const { data } = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
                newUserCallbackURL: "/onboarding",
              });
              if (data) {
                router.push("/dashboard");
              }
            } catch (error) {
              console.log(error);
              toast.error("Uh oh! Something went wrong.", {
                className: "text-foreground",
              });
            }
          }}
        >
          <Google /> Continue with Google
        </Button>
      </div>
    </>
  );
};

const Google = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24"
      height="24"
      style={{ opacity: 1 }}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      />
    </svg>
  );
};

const SignUpSchema = z.object({
  email: z.string().nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
  name: z.string().nonempty("Name is required"),
});

type SignUpFormFields = z.infer<typeof SignUpSchema>;

export const SignUpForm = () => {
  const methods = useForm<SignUpFormFields>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    resolver: zodResolver(SignUpSchema),
  });
  const router = useRouter();

  const signUpSubmitted: SubmitHandler<SignUpFormFields> = async (formData) => {
    const { email, password, name } = formData;
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        // callbackURL: "/onboarding",
      });
      router.push("/onboarding");
      console.log(error);
      console.log(data);
    } catch (error) {
      console.log(error);
      methods.setError("root", {
        message: "Something went wrong",
      });
      toast.error("Uh oh! Something went wrong.", {
        className: "text-foreground",
      });
    }
  };

  return (
    <>
      {methods.formState.isSubmitting && (
        <BarLoaderFullScreenWidth loading={methods.formState.isSubmitting} />
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
                  placeholder="Enter username"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="my-2">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-muted-foreground"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter email"
                  autoComplete="off"
                  type="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="my-2">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-muted-foreground"
                >
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter password"
                  autoComplete="off"
                  type="password"
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
            Sign Up
          </Button>
        </div>
      </form>
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-muted-foreground/30" />
        <span className="text-sm font-medium text-muted-foreground">OR</span>
        <hr className="flex-1 border-muted-foreground/30" />
      </div>
      <div className="flex my-3">
        <Button
          className="w-full"
          variant={"outline"}
          onClick={async () => {
            try {
              const { data } = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/onboarding",
                newUserCallbackURL: "/onboarding",
              });
              if (data) {
                router.push("/onboarding");
              }
            } catch (error) {
              console.log(error);
              toast.error("Uh oh! Something went wrong.", {
                className: "text-foreground",
              });
            }
          }}
        >
          <Google /> Continue with Google
        </Button>
      </div>
    </>
  );
};

export const useSusiDialog = () => {
  const [showDialog, setShowDialog] = useState(false);

  const SusiDialog = () => (
    <ShowSusiDialog showDialog={showDialog} setShowDialog={setShowDialog} />
  );

  const setSusiDialog = (show: boolean) => {
    setShowDialog(show);
  };

  return {
    setSusiDialog,
    SusiDialog,
  };
};
