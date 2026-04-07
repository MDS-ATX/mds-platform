"use client";

interface BedroomFilterProps {
  options: { label: string; value: number | null }[];
  selected: number | null;
  onChange: (value: number | null) => void;
}

export default function BedroomFilter({
  options,
  selected,
  onChange,
}: BedroomFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            selected === opt.value
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
