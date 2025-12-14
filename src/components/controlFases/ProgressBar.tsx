//src/components/controlFases/ProgressBar.tsx
import React from "react";

export default function ProgressBar({
  value,
  widthPx = 100,
}: {
  value: number;
  widthPx?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative h-2 rounded-full bg-slate-200"
      style={{ width: `${widthPx}px` }}
    >
      <div
        className="absolute left-0 top-0 h-2 rounded-full bg-indigo-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
