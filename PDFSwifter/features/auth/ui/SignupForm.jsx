'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { signupSchema } from "@/shared/validation/auth-schemas";
import { useValidatedForm } from "@/shared/hooks/useValidatedForm";
import { useAuthAction } from "@/features/auth/hooks/useAuthAction";

const INITIAL_SIGNUP_VALUES = { name: "", email: "", password: "", confirm: "", accept: false };

export default function SignupForm() {
  const { form, errors, setField, validate, reset } = useValidatedForm(
    INITIAL_SIGNUP_VALUES,
    signupSchema
  );
  const { submit, submitting, success, formError, setFormError, resetSuccess } = useAuthAction({
    endpoint: "/api/auth/signup",
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (success) {
      reset();
    }
  }, [reset, success]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (formError) {
      setFormError("");
    }
    if (success) {
      resetSuccess();
      setSuccessMessage("");
    }
    setField(name, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validate();
    if (!result.success) {
      return;
    }
    const response = await submit({
      username: result.data.name,
      email: result.data.email,
      password: result.data.password,
    });
    if (response?.success) {
      setSuccessMessage(response.payload?.message || "Account created successfully.");
    }
  };

  return (
    <>
      {success && (
        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-900">
          {successMessage || "Account created successfully. You can sign in now."}
        </div>
      )}

      {formError && (
        <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-900">{formError}</div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Full name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`mt-2 block w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none ring-0 transition focus:ring-4 ${
              errors.name
                ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200/60"
                : "border-slate-200 focus:border-amber-300 focus:ring-amber-200/70"
            }`}
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <p id="name-error" className="mt-2 text-xs font-medium text-rose-700">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`mt-2 block w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none ring-0 transition focus:ring-4 ${
              errors.email
                ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200/60"
                : "border-slate-200 focus:border-amber-300 focus:ring-amber-200/70"
            }`}
            placeholder="you@example.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && <p id="email-error" className="mt-2 text-xs font-medium text-rose-700">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800">Password</label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`mt-2 block w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none ring-0 transition focus:ring-4 ${
                errors.password
                  ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200/60"
                  : "border-slate-200 focus:border-amber-300 focus:ring-amber-200/70"
              }`}
              type="password"
              placeholder="Create a secure password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && <p id="password-error" className="mt-2 text-xs font-medium text-rose-700">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">Confirm</label>
            <input
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className={`mt-2 block w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none ring-0 transition focus:ring-4 ${
                errors.confirm
                  ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200/60"
                  : "border-slate-200 focus:border-amber-300 focus:ring-amber-200/70"
              }`}
              type="password"
              placeholder="Repeat password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? "confirm-error" : undefined}
            />
            {errors.confirm && <p id="confirm-error" className="mt-2 text-xs font-medium text-rose-700">{errors.confirm}</p>}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="accept"
            name="accept"
            type="checkbox"
            checked={form.accept}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-200"
          />
          <label htmlFor="accept" className="text-sm font-medium text-slate-700">
            I agree to the{" "}
            <a href="/privacy" className="font-semibold text-slate-900 hover:text-slate-700 underline underline-offset-4">
              privacy policy
            </a>
          </label>
        </div>
        {errors.accept && <p className="mt-2 text-xs font-medium text-rose-700">{errors.accept}</p>}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-slate-900 hover:text-slate-700 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}
