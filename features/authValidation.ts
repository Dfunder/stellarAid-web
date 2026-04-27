import { z } from "zod";

// shared rules
const emailRule = z
  .string()
  .min(1, "Email is required")
  .email("Must be a valid email");

const passwordRule = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const registerSchema = z
  .object({
    email: emailRule,
    role: z.enum(["donor", "creator"], {
      message: "Please select a valid role",
    }),
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailRule,
});

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    token: z.string().min(1, "Token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
