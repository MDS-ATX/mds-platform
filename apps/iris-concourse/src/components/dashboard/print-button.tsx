"use client";

export function PrintButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors print:hidden"
    >
      {label}
    </button>
  );
}
