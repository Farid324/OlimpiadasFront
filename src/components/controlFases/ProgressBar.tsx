// src/components/controlFases/ProgressBar.tsx
import React from "react";

export default function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-indigo-600"
        style={{ width: `${safe}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
      />
    </div>
  );
}
