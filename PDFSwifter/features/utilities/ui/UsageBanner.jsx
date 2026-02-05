"use client";

export default function UsageBanner({ usage, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
        Checking usage status...
      </div>
    );
  }

  if (!usage) return null;

  const isUnlimited = usage.limit === null || usage.limit === undefined;
  const limitLabel = isUnlimited
    ? "Unlimited usage"
    : `${usage.remaining ?? 0} of ${usage.limit ?? 3} uses remaining this month`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="font-semibold text-gray-900">Free plan</span>
        <span className="mx-2 text-gray-300">•</span>
        <span>{limitLabel}</span>
      </div>
    </div>
  );
}
