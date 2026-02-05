import { Suspense } from "react";
import PaymentResponseClient from "@/features/payment/ui/PaymentResponseClient";

export const metadata = {
  title: "Payment Verification | pdfSwifter",
  description: "Verifying your payment status.",
};

export default function PaymentResponsePage() {
  return (
    <Suspense fallback={<div />}>
      <PaymentResponseClient />
    </Suspense>
  );
}
