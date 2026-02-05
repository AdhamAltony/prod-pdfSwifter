"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentErrorClient() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("errorCode");
  const errorText = searchParams.get("errorText");
  const paymentId = searchParams.get("paymentId");
  const errorMessage = errorText
    ? decodeURIComponent(errorText)
    : errorCode
      ? `Payment failed with error code: ${errorCode}`
      : "An error occurred during payment processing.";

  useEffect(() => {
    console.error("Payment error:", { errorCode, errorText, paymentId });
  }, [errorCode, errorText, paymentId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>

          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">Common reasons for payment failure:</p>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li>• Insufficient funds</li>
              <li>• Incorrect card details</li>
              <li>• Card expired or blocked</li>
              <li>• Payment gateway timeout</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pricing"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Try Again
            </Link>
            <Link
              href="/contact"
              className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Contact Support
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link href="/contact" className="text-teal-600 hover:text-teal-700 font-medium">
                Get in touch with our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
