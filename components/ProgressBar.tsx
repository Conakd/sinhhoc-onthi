export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = Math.round((current / total) * 100) || 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      ></div>
      <p className="text-xs text-gray-500 mt-1 text-right">{current} / {total}</p>
    </div>
  );
}