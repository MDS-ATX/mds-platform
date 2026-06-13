"use client";

import { useState } from "react";
import { type ResidentialUnit, unitUrl } from "@/lib/inventory/types";

// ─── Copy selected units to email ────────────────────────────────────────────
// Ports the JacobInAustin floor-plan clipboard pattern: writes both a rich
// text/html table and a text/plain fallback so it pastes cleanly into Gmail /
// Outlook. Columns copied: Unit #, Bed/Bath, SqFt, Price, HOA (finish columns
// are intentionally NOT copied). Only explicitly-selected units are copied so
// nothing is included by accident.

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
  return `${u.beds} / ${u.baths}`;
}
function pricesAsOf(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function buildPlainText(units: ResidentialUnit[]): string {
  const lines: string[] = [];
  lines.push(`Prices as of ${pricesAsOf()}`);
  lines.push("");
  lines.push(["Unit", "Bed/Bath", "SqFt", "Price", "HOA"].join("\t"));
  for (const u of units) {
    lines.push([u.unitNumber, bedBath(u), fmtNum(u.sqft), fmtPrice(u.price), fmtHoa(u)].join("\t"));
  }
  return lines.join("\n");
}

function buildHtml(units: ResidentialUnit[]): string {
  const parts: string[] = [];
  parts.push(`<div style="font-family:Arial,sans-serif;font-size:14px;">`);
  parts.push(`<p style="margin:0 0 8px;font-size:14px;color:#191919;">Prices as of ${pricesAsOf()}</p>`);
  parts.push(`<table style="border-collapse:collapse;font-size:13px;">`);
  const th = (label: string, align = "left") =>
    `<th style="padding:6px 12px;text-align:${align};font-weight:600;border-bottom:2px solid #ddd;">${label}</th>`;
  parts.push(
    `<thead><tr style="background:#e8e8e8;">${th("Unit")}${th("Bed/Bath", "center")}${th("SqFt", "right")}${th("Price", "right")}${th("HOA", "right")}</tr></thead>`
  );
  parts.push(`<tbody>`);
  for (const u of units) {
    const td = (content: string, align = "left") =>
      `<td style="padding:5px 12px;text-align:${align};">${content}</td>`;
    const unitCell = `<td style="padding:5px 12px;"><a href="${unitUrl(u.building, u.unitNumber)}" style="color:#2563eb;text-decoration:none;">${u.unitNumber}</a></td>`;
    parts.push(
      `<tr style="border-bottom:1px solid #eee;">${unitCell}${td(bedBath(u), "center")}${td(fmtNum(u.sqft), "right")}${td(fmtPrice(u.price), "right")}${td(fmtHoa(u), "right")}</tr>`
    );
  }
  parts.push(`</tbody></table></div>`);
  return parts.join("");
}

export function CopyControls({ selectedUnits }: { selectedUnits: ResidentialUnit[] }) {
  const [copied, setCopied] = useState(false);
  const count = selectedUnits.length;

  const handleCopy = async () => {
    if (count === 0) return;
    const plainText = buildPlainText(selectedUnits);
    const html = buildHtml(selectedUnits);
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

  return (
    <button
      onClick={handleCopy}
      disabled={count === 0}
      title={count === 0 ? "Select one or more units to copy" : undefined}
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
  );
}
