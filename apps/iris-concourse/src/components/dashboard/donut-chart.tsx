interface Segment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  label?: string;
  sublabel?: string;
}

export function DonutChart({ segments, size = 120, label, sublabel }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-8 border-gray-100 text-xs text-gray-400"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const strokeWidth = size * 0.15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, i) => {
          if (segment.value === 0) return null;
          const segmentLength = (segment.value / total) * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += segmentLength;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
      </svg>
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900 leading-none">{label}</span>
          {sublabel && <span className="text-[10px] text-gray-500 mt-1">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
