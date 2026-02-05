import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Name is required" }),
    email: z.string().trim().email({ message: "Enter a valid email" }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }),
    confirm: z.string(),
    accept: z.literal(true, {
      errorMap: () => ({ message: "You must accept the privacy policy" }),
    }),
  })
  .refine((values) => values.password === values.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const signinSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export function zodErrorToFieldMap(error) {
  return error.errors.reduce((acc, issue) => {
    const key = issue.path?.[0] || "form";
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}
