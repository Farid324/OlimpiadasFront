export default function ProgressBar({ done, total }:{done:number; total:number}) {
  const pct = Math.max(0, Math.min(100, Math.round((done/total)*100)));
  return (
    <div className="w-40">
      <div className="h-2 bg-gray-200 rounded-full">
        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-600">{done}/{total}</div>
    </div>
  );
}
