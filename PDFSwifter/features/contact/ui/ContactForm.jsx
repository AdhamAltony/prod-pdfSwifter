"use client";

import React, { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;
    setSubmitting(true);
    try {
      // simulate network
      await new Promise((r) => setTimeout(r, 900));
      console.log("Contact submit:", form);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setErrors({ form: "Unable to send message. Try again later." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
      <p className="text-xs uppercase tracking-[0.35em] text-sky-700">Contact</p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-900">Send us a message</h3>
      <p className="mt-2 text-sm text-slate-600">Tell us what you need and we’ll get back to you.</p>

      {success && (
        <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800">
          Message sent (demo)
        </div>
      )}

      {errors.form && (
        <div className="mt-4 rounded-md bg-rose-50 border border-rose-100 p-3 text-sm text-rose-800">
          {errors.form}
        </div>
      )}

      <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-700">Your name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${
              errors.name ? "border-rose-300 focus:ring-rose-200" : "border-slate-200 focus:ring-sky-200"
            }`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && <p id="name-error" className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${
              errors.email ? "border-rose-300 focus:ring-rose-200" : "border-slate-200 focus:ring-sky-200"
            }`}
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Subject (optional)</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${
              errors.message ? "border-rose-300 focus:ring-rose-200" : "border-slate-200 focus:ring-sky-200"
            }`}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && <p id="message-error" className="mt-1 text-xs text-rose-600">{errors.message}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}
