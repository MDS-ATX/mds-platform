// Render the report page (now reading the fresh snapshot) to a PDF and email it.
// Run after refresh-snapshot.mjs against the locally-started app in CI.
import fs from "node:fs";
import puppeteer from "puppeteer";

try {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PASS = process.env.ADMIN_PASSWORD;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RECIPIENTS = (process.env.REPORT_RECIPIENTS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const FROM = process.env.REPORT_FROM || "reports@example.com";

// Auth cookie for the gated report page.
const login = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: PASS }),
});
const cookieStr = (login.headers.get("set-cookie") || "").split(";")[0];
const [name, value] = cookieStr.split("=");

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setCookie({ name, value, domain: new URL(BASE).hostname, path: "/" });
await page.goto(`${BASE}/reports/iris-concourse`, { waitUntil: "networkidle0", timeout: 120000 });
const pdf = await page.pdf({
  format: "Letter",
  printBackground: true,
  margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
});
await browser.close();
fs.writeFileSync("report.pdf", pdf);
console.log("PDF written: report.pdf");

// Human-friendly name for the emailed attachment: "CC Iris Traffic Report - <week-ending date>.pdf".
let attachmentName = "CC Iris Traffic Report.pdf";
try {
  const snap = JSON.parse(fs.readFileSync("src/data/report-snapshot.json", "utf8"));
  const end = snap?.report?.periodEnd; // e.g. "7/19/26"
  if (end) attachmentName = `CC Iris Traffic Report - ${end.replace(/\//g, ".")}.pdf`;
} catch {}

if (RESEND_API_KEY && RECIPIENTS.length) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: RECIPIENTS,
      subject: "Concourse & Iris — Weekly Traffic Report",
      text: "This week's Concourse & Iris weekly traffic report is attached.",
      attachments: [
        { filename: attachmentName, content: Buffer.from(pdf).toString("base64") },
      ],
    }),
  });
  console.log("Email:", res.status, res.ok ? "sent" : await res.text());
} else {
  console.log("Email skipped (set RESEND_API_KEY + REPORT_RECIPIENTS to enable).");
}
