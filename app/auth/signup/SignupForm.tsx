"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button, Input, useToast } from "@/components/ui";
import PasswordInput from "@/components/passwordInput";
// import { FcGoogle } from "react-icons/fc";
// import { SiStellar } from "react-icons/si";

// form & validation
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/features/authValidation";
import { RadioOption } from "@/components/ui/radioOption";
import { signIn } from "next-auth/react";

interface RegisterFormData {
  email: string;
  role: "donor" | "creator";
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const router = useRouter();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "donor",
      password: "",
      confirmPassword: "",
    },
  });

  const handleCreate = useCallback(
    async (data: RegisterFormData) => {
      try {
        // TODO: Replace with actual API call when backend is ready
        // await dispatch(registerUser(data)).unwrap();

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success(
          "Registration successful! Please check your email to verify your account.",
        );
        router.push("/auth/verify-email");
      } catch (err: any) {
        toast.error(err?.message || "Registration failed. Please try again.");
      }
    },
    [toast, router],
  );

  return (
    <div className="min-h-screen w-full  flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={handleSubmit(handleCreate)}
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "36px 32px 32px",
          width: "100%",
          maxWidth: "420px",
          boxShadow:
            "0 8px 40px rgba(30,58,138,0.10), 0 1px 4px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.45s ease both",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          margin: "20px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(30,58,138,0.30)",
            }}
          >
            <span
              style={{ color: "#fff", fontWeight: "700", fontSize: "18px" }}
            >
              S
            </span>
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#1e293b",
              letterSpacing: "-0.01em",
            }}
          >
            StellarAid
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Create Account
          </h1>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
            Join our transparent giving community
          </p>
        </div>

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              inputState={errors.email ? "error" : "default"}
            />
          )}
        />

        {/* Role selection */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#374151",
                }}
              >
                I want to
              </span>
              <RadioOption
                id="donor"
                name="role"
                value="donor"
                label="Support projects (Donor)"
                checked={field.value === "donor"}
                onChange={() => field.onChange("donor")}
              />
              <RadioOption
                id="creator"
                name="role"
                value="creator"
                label="Create a campaign (Creator)"
                checked={field.value === "creator"}
                onChange={() => field.onChange("creator")}
              />
            </div>
          )}
        />
        {errors.role && (
          <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
        )}

        {/* Password */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              label="Password"
              id="password"
              showStrength={true}
              autoComplete="new-password"
            />
          )}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}

        {/* Confirm Password */}
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              label="Confirm Password"
              id="confirm-password"
              autoComplete="new-password"
            />
          )}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">
            {errors.confirmPassword.message}
          </p>
        )}

        {/* Primary CTA */}
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Creating Account…" : "Create Account"}
        </Button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        </div>

        {/* Social / Wallet */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            type="button"
            onClick={() => signIn("google")}
            disabled={isSubmitting}
            aria-label="Continue with Google"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => signIn("github")}
            disabled={isSubmitting}
            aria-label="Continue with GitHub"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Continue with GitHub
          </button>

          <button
            type="button"
            disabled
            aria-label="Connect Stellar Wallet (coming soon)"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Connect Stellar Wallet
          </button>
        </div>

        {/* Sign-in link */}
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            style={{
              color: "#1d4ed8",
              fontWeight: "600",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1e3a8a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1d4ed8")}
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
