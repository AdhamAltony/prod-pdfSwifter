import { useCallback, useState } from "react";

export function useAuthAction({ endpoint, method = "POST", payloadTransformer }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const resetSuccess = useCallback(() => setSuccess(false), []);

  const submit = useCallback(
    async (data) => {
      setFormError("");
      setSuccess(false);
      setSubmitting(true);
      try {
        const body = payloadTransformer ? payloadTransformer(data) : new URLSearchParams(data);
        const response = await fetch(endpoint, {
          method,
          body,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const payload = await response.json();
        if (payload.success) {
          setSuccess(true);
          return { success: true, payload };
        }

        const errorMsg = payload.message || "Request failed";
        setFormError(errorMsg);
        return { success: false, error: errorMsg };
      } catch (error) {
        console.error("Auth action error:", error);
        const message = "Something went wrong. Please try again.";
        setFormError(message);
        return { success: false, error: message };
      } finally {
        setSubmitting(false);
      }
    },
    [endpoint, method, payloadTransformer]
  );

  return { submit, submitting, success, formError, setFormError, resetSuccess };
}
