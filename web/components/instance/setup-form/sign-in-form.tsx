import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// ui
import { Input, Button } from "@plane/ui";
// icons
import { XCircle } from "lucide-react";
// services
import { AuthService } from "services/auth.service";
const authService = new AuthService();
// hooks
import useToast from "hooks/use-toast";
// helpers
import { checkEmailValidity } from "helpers/string.helper";

interface InstanceSetupEmailFormValues {
  email: string;
  password: string;
}

export interface IInstanceSetupEmailForm {
  handleNextStep: (email: string) => void;
}

export const InstanceSetupSignInForm: FC<IInstanceSetupEmailForm> = (props) => {
  const { handleNextStep } = props;
  const {
    user: { fetchCurrentUser },
  } = useMobxStore();
  // form info
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm<InstanceSetupEmailFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // hooks
  const { setToastAlert } = useToast();

  const handleFormSubmit = async (formValues: InstanceSetupEmailFormValues) => {
    const payload = {
      email: formValues.email,
      password: formValues.password,
    };

    await authService
      .instanceAdminSignIn(payload)
      .then(async () => {
        await fetchCurrentUser();
        handleNextStep(formValues.email);
      })
      .catch((err) => {
        setToastAlert({
          type: "error",
          title: "Error!",
          message: err?.error ?? "Something went wrong. Please try again.",
        });
      });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h1 className="text-center text-2xl sm:text-2.5xl font-medium text-onboarding-text-100">
        Let{"'"}s secure your instance
      </h1>
      <p className="text-center text-sm text-onboarding-text-200 mt-3">
        Explore privacy options. Get AI features. Secure access.
        <br />
        Takes 2 minutes.
      </p>
      <div className="relative mt-5 w-full sm:w-96 mx-auto space-y-4">
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email address is required",
            validate: (value) => checkEmailValidity(value) || "Email is invalid",
          }}
          render={({ field: { value, onChange } }) => (
            <div className="flex items-center relative rounded-md bg-onboarding-background-200">
              <Input
                id="email"
                name="email"
                type="email"
                value={value}
                onChange={onChange}
                placeholder="orville.wright@firstflight.com"
                className="w-full h-[46px] placeholder:text-onboarding-text-400 border border-onboarding-border-100 pr-12"
              />
              {value.length > 0 && (
                <XCircle
                  className="h-5 w-5 absolute stroke-custom-text-400 hover:cursor-pointer right-3"
                  onClick={() => setValue("email", "")}
                />
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
          }}
          render={({ field: { value, onChange } }) => (
            <Input
              type="password"
              value={value}
              onChange={onChange}
              hasError={Boolean(errors.password)}
              placeholder="Enter password"
              className="w-full h-[46px] placeholder:text-onboarding-text-400 border border-onboarding-border-100 pr-12 !bg-onboarding-background-200"
            />
          )}
        />
        <p className="text-xs text-custom-text-200 pb-2">
          Use your email address if you are the instance admin. <br /> Use your admin’s e-mail if you are not.
        </p>
        <Button variant="primary" className="w-full" size="xl" type="submit" loading={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
};
