'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { signinSchema } from "@/shared/validation/auth-schemas";
import { useValidatedForm } from "@/shared/hooks/useValidatedForm";
import { useAuthAction } from "@/features/auth/hooks/useAuthAction";

const INITIAL_SIGNIN_VALUES = { email: "", password: "", remember: false };

export default function SigninForm() {
  const { form, errors, setField, validate, reset } = useValidatedForm(
    INITIAL_SIGNIN_VALUES,
    signinSchema
  );
  const { submit, submitting, success, formError, setFormError, resetSuccess } = useAuthAction({
    endpoint: "/api/auth/signin",
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
      email: result.data.email,
      password: result.data.password,
    });
    if (response?.success) {
      setSuccessMessage(
        response.payload?.message ||
          `Signed in as ${response.payload?.user?.username || response.payload?.user?.email || "user"}.`
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:changed"));
      }
    }
  };

  return (
    <>
      {success && (
        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-900">
          {successMessage || "Signed in successfully."}
        </div>
      )}

      {formError && (
        <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-900">{formError}</div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
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
            placeholder="Your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && <p id="password-error" className="mt-2 text-xs font-medium text-rose-700">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name="remember"
              type="checkbox"
              checked={form.remember}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-200"
            />
            Remember me
          </label>
          <Link href="/help" className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-4">
            Forgot password?
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link href="/signup" className="font-semibold text-slate-900 hover:text-slate-700 underline underline-offset-4">
          Create one
        </Link>
      </p>
    </>
  );
}
