interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
}

export function ProgressBar({ value, color = "#1a1a1a" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
