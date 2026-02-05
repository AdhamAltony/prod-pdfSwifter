import { Suspense } from "react";
import PaymentErrorClient from "@/features/payment/ui/PaymentErrorClient";

export const metadata = {
  title: "Payment Failed | pdfSwifter",
  description: "We could not process your payment. Review common issues and try again.",
};

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<div />}>
      <PaymentErrorClient />
    </Suspense>
  );
}
