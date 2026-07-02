"use client";

import { useState } from "react";
import { type ResidentialUnit, unitUrl, FINISH_FIELDS, DESIGNATION_LABELS, STATUS_LABELS } from "@/lib/inventory/types";

// ─── Copy selected units to email ────────────────────────────────────────────
// Ports the JacobInAustin floor-plan clipboard pattern: writes both a rich
// text/html table and a text/plain fallback so it pastes cleanly into Gmail /
// Outlook. The columns copied are user-selectable via the "Columns" picker —
// Unit / Bed·Bath / SqFt / Price / HOA are on by default; finish columns
// (views, appliances, cabinets, etc.) can be toggled on to build a custom
// table. Only explicitly-selected units are copied so nothing is included by
// accident.

function fmtNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function fmtPrice(n: number): string {
  return `$${fmtNum(n)}`;
}
function fmtHoa(u: ResidentialUnit): string {
  if (u.hoaFee == null) return "—";
  return `$${fmtNum(u.hoaFee)}/mo${u.hoaEstimated ? "*" : ""}`;
}
function bedBath(u: ResidentialUnit): string {
  return u.baths ? `${u.beds} / ${u.baths}` : `${u.beds}`;
}
function pricesAsOf(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Copyable column registry ────────────────────────────────────────────────
// Each column knows how to render itself as a header, a plain-text cell, and an
// HTML cell (defaulting to the plain value). `defaultOn` marks the five columns
// that are checked initially.
type Align = "left" | "center" | "right";
interface CopyColumn {
  key: string;
  label: string;
  align: Align;
  defaultOn?: boolean;
  plain: (u: ResidentialUnit) => string;
  /** HTML cell content; falls back to the escaped plain value. */
  html?: (u: ResidentialUnit) => string;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const finishColumns: CopyColumn[] = FINISH_FIELDS.map(({ key, label }) => ({
  key: key as string,
  label,
  align: "left" as Align,
  plain: (u: ResidentialUnit) => (u[key] as string | undefined) ?? "—",
}));

export const COPY_COLUMNS: CopyColumn[] = [
  {
    key: "unit",
    label: "Unit",
    align: "left",
    defaultOn: true,
    plain: (u) => u.unitNumber,
    html: (u) =>
      `<a href="${unitUrl(u.building, u.unitNumber)}" style="color:#2563eb;text-decoration:none;">${esc(u.unitNumber)}</a>`,
  },
  { key: "bedBath", label: "Bed/Bath", align: "center", defaultOn: true, plain: bedBath },
  { key: "sqft", label: "SqFt", align: "right", defaultOn: true, plain: (u) => fmtNum(u.sqft) },
  { key: "price", label: "Price", align: "right", defaultOn: true, plain: (u) => fmtPrice(u.price) },
  { key: "hoa", label: "HOA", align: "right", defaultOn: true, plain: fmtHoa },
  { key: "designation", label: "Designation", align: "left", plain: (u) => DESIGNATION_LABELS[u.designation] },
  { key: "status", label: "Status", align: "left", plain: (u) => STATUS_LABELS[u.status] },
  ...finishColumns,
  { key: "notes", label: "Notes", align: "left", plain: (u) => u.notes ?? "" },
];

const DEFAULT_COLUMN_KEYS = COPY_COLUMNS.filter((c) => c.defaultOn).map((c) => c.key);

function buildPlainText(units: ResidentialUnit[], cols: CopyColumn[]): string {
  const lines: string[] = [];
  lines.push(`Prices as of ${pricesAsOf()}`);
  lines.push("");
  lines.push(cols.map((c) => c.label).join("\t"));
  for (const u of units) {
    lines.push(cols.map((c) => c.plain(u)).join("\t"));
  }
  return lines.join("\n");
}

function buildHtml(units: ResidentialUnit[], cols: CopyColumn[]): string {
  const parts: string[] = [];
  parts.push(`<div style="font-family:Arial,sans-serif;font-size:14px;">`);
  parts.push(`<p style="margin:0 0 8px;font-size:14px;color:#191919;">Prices as of ${pricesAsOf()}</p>`);
  parts.push(`<table style="border-collapse:collapse;font-size:13px;">`);
  const th = (label: string, align: Align) =>
    `<th style="padding:6px 12px;text-align:${align};font-weight:600;border-bottom:2px solid #ddd;">${esc(label)}</th>`;
  parts.push(`<thead><tr style="background:#e8e8e8;">${cols.map((c) => th(c.label, c.align)).join("")}</tr></thead>`);
  parts.push(`<tbody>`);
  for (const u of units) {
    const cells = cols
      .map((c) => {
        const content = c.html ? c.html(u) : esc(c.plain(u));
        return `<td style="padding:5px 12px;text-align:${c.align};">${content}</td>`;
      })
      .join("");
    parts.push(`<tr style="border-bottom:1px solid #eee;">${cells}</tr>`);
  }
  parts.push(`</tbody></table></div>`);
  return parts.join("");
}

export function CopyControls({ selectedUnits }: { selectedUnits: ResidentialUnit[] }) {
  const [copied, setCopied] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(DEFAULT_COLUMN_KEYS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const count = selectedUnits.length;

  // Keep columns in registry order regardless of the order they were toggled.
  const activeCols = COPY_COLUMNS.filter((c) => selectedKeys.includes(c.key));

  const handleCopy = async () => {
    if (count === 0 || activeCols.length === 0) return;
    const plainText = buildPlainText(selectedUnits, activeCols);
    const html = buildHtml(selectedUnits, activeCols);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([plainText], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
      } catch {
        // Clipboard unavailable
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCol = (key: string) =>
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="flex items-center gap-2">
      {/* Column picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          <svg className="h-4 w-4 text-brand-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h14M3 10h14M3 15h14" />
          </svg>
          Columns
          <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] text-brand-600">{activeCols.length}</span>
        </button>
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 max-h-80 w-56 overflow-auto rounded-md border border-brand-200 bg-white p-1 shadow-lg">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">Copy columns</span>
                <button
                  onClick={() => setSelectedKeys(DEFAULT_COLUMN_KEYS)}
                  className="text-[11px] text-brand-500 underline hover:text-black"
                >
                  Reset
                </button>
              </div>
              {COPY_COLUMNS.map((c) => (
                <label
                  key={c.key}
                  className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded px-2 py-1 text-sm hover:bg-brand-50"
                >
                  <input type="checkbox" checked={selectedKeys.includes(c.key)} onChange={() => toggleCol(c.key)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        disabled={count === 0 || activeCols.length === 0}
        title={
          count === 0
            ? "Select one or more units to copy"
            : activeCols.length === 0
            ? "Select at least one column to copy"
            : undefined
        }
        className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copied ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copied to clipboard
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
            {count > 0 ? `Copy ${count} to email` : "Copy to email"}
          </>
        )}
      </button>
    </div>
  );
}
