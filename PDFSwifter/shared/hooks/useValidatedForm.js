import { useCallback, useState } from "react";
import { zodErrorToFieldMap } from "@/shared/validation/auth-schemas";

export function useValidatedForm(initialValues, schema) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const parsed = schema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return { success: true, data: parsed.data };
    }
    const mapped = zodErrorToFieldMap(parsed.error);
    setErrors(mapped);
    return { success: false, errors: mapped };
  }, [form, schema]);

  const reset = useCallback(() => {
    setForm(initialValues);
    setErrors({});
  }, [initialValues]);

  return { form, errors, setField, validate, reset, setErrors };
}
