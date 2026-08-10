import type { Metadata } from "next";
import Link from "next/link";
import projectData from "@/data/project.json";
import { getReportData } from "@/lib/dashboard/get-report-data";
import { readSnapshot, readSnapshotForWeek } from "@/lib/dashboard/snapshot";
import type { DealDetail } from "@/lib/dashboard/report";
import { PrintButton } from "@/components/dashboard/print-button";
import { NotConnectedBanner } from "@/components/dashboard/not-connected";

type ReportSearchParams = Promise<{ week?: string }>;

// Renders from the committed weekly snapshot (instant). Dynamic so each request
// reads the latest snapshot file. maxDuration covers the rare live fallback.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Sets the browser tab title — and therefore the default filename when the user
// prints / Saves-as-PDF — to "CC Iris Traffic Report - <week-ending date>".
export async function generateMetadata({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}): Promise<Metadata> {
  const { week } = await searchParams;
  const snap = (week ? readSnapshotForWeek(week) : null) ?? readSnapshot();
  const end = snap?.report?.periodEnd; // e.g. "7/19/26"
  const date = end ? end.replace(/\//g, ".") : "";
  return { title: date ? `CC Iris Traffic Report - ${date}` : "CC Iris Traffic Report" };
}

const PROJECT_NAME = projectData.name;
const DEVELOPER = projectData.developer.name;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    timeZone: "America/Chicago",
  });
}

function money(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}


function dealValue(d: DealDetail): number | null {
  return d.net ?? d.offerPrice ?? d.basePrice;
}

// ─── Building blocks ─────────────────────────────────────────────────────────

/** Big top-level part divider. */
function PartHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-12 mb-6 border-t-2 border-gray-900 pt-3 first:mt-0">
      <h2 className="text-lg font-bold uppercase tracking-[0.12em]">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/** Sub-section heading inside a part. */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-[0.15em]">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function KPI({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
      <p className="text-xs uppercase tracking-wide text-gray-500 mt-1.5">{label}</p>
      {sub && <p className="text-sm text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

const TH = "text-left text-xs font-bold text-gray-400 uppercase py-2 pr-4";
const TD = "py-2 pr-4 align-top";

function DealTable({
  rows,
  dateLabel,
  dateField,
}: {
  rows: DealDetail[];
  dateLabel: string;
  dateField: "offerDate" | "executedDate";
}) {
  if (rows.length === 0) return <p className="text-sm text-gray-400">None.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            <th className={`${TH} w-1/6`}>Unit</th>
            <th className="text-center text-xs font-bold text-gray-400 uppercase py-2 pr-4 w-1/6">
              {dateLabel}
            </th>
            <th className={`${TH} w-1/6 text-right`}>Offer Price</th>
            <th className={`${TH} w-1/6 text-right`}>Net Price</th>
            <th className={`${TH} w-1/6 text-right`}>Incentive</th>
            <th className={`${TH} w-1/6 text-right`}>Base Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((d) => (
            <tr key={`${d.building}-${d.unit}`}>
              <td className={`${TD} whitespace-nowrap font-medium text-gray-900`}>
                {d.unit} <span className="text-gray-400 font-normal capitalize">{d.building}</span>
              </td>
              <td className={`${TD} whitespace-nowrap text-center`}>{fmtDate(d[dateField])}</td>
              <td className={`${TD} text-right`}>{money(d.offerPrice)}</td>
              <td className={`${TD} text-right font-medium text-gray-900`}>{money(d.net)}</td>
              <td className={`${TD} text-right`}>{d.incentive ?? "—"}</td>
              <td className={`${TD} text-right`}>{money(d.basePrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Row {
  key: string;
  name: string;
  leadType: string;
  community: string;
  source: string;
  date: string | null;
}

function RowsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <p className="text-sm text-gray-400">None this week.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            <th className={`${TH} w-1/5`}>Name</th>
            <th className={`${TH} w-1/5`}>Lead Type</th>
            <th className={`${TH} w-1/5`}>Community</th>
            <th className={`${TH} w-1/5`}>Source</th>
            <th className={`${TH} w-1/5`}>Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.key}>
              <td className={`${TD} font-medium text-gray-900`}>{r.name}</td>
              <td className={TD}>{r.leadType}</td>
              <td className={TD}>{r.community}</td>
              <td className={TD}>{r.source}</td>
              <td className={TD}>{fmtDate(r.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function WeeklyReportPage({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  const { week } = await searchParams;
  // A ?week= param renders that archived week; otherwise the latest snapshot
  // (instant), falling back to a live pull only if no snapshot exists.
  const archived = week ? readSnapshotForWeek(week) : null;
  const { connected, error, report } = archived ?? readSnapshot() ?? (await getReportData());
  const c = report.contract;
  const tp = report.touchPoints;
  const period = `${report.periodStart} – ${report.periodEnd}`;
  const ucValue = c.underContract.reduce((sum, d) => sum + (dealValue(d) ?? 0), 0);
  const offersValue = c.offers.reduce((sum, d) => sum + (dealValue(d) ?? 0), 0);

  const newRows: Row[] = report.newProspectRows.map((r) => ({
    key: `n-${r.id}`,
    name: r.name,
    leadType: r.leadType,
    community: r.community,
    source: r.source,
    date: r.created,
  }));
  const returnRows: Row[] = report.returnProspectRows.map((r) => ({
    key: `r-${r.id}`,
    name: r.name,
    leadType: r.leadType,
    community: r.community,
    source: r.source,
    date: r.lastActivity,
  }));
  const visitRows: Row[] = report.visitList.map((v, i) => ({
    key: `v-${i}`,
    name: v.name,
    leadType: v.leadType,
    community: v.community,
    source: v.source,
    date: v.date,
  }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 print:py-0 text-gray-900 text-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        {/* White MDS logo flipped to black for the light report background. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logos/mds-logo.png"
          alt="MODUS Development Services"
          width={200}
          height={40}
          className="h-9 w-auto brightness-0"
        />
        <div className="flex items-center gap-4 print:hidden">
          <Link href="/reports/iris-concourse/history" className="text-sm text-gray-500 hover:text-gray-900 underline">
            Report history
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="border-b-2 border-gray-900 pb-4 mb-2">
        <h1 className="text-2xl font-bold">{PROJECT_NAME}</h1>
        <p className="text-gray-700 mt-1">Weekly Traffic Report · {period}</p>
        <p className="text-sm text-gray-500 mt-0.5">Prepared for {DEVELOPER}</p>
        {archived && (
          <p className="text-xs text-gray-400 mt-1 print:hidden">
            Viewing archived report · <Link href="/reports/iris-concourse" className="underline">back to latest</Link>
          </p>
        )}
      </div>

      {!connected && (
        <div className="my-6">
          <NotConnectedBanner error={error} />
        </div>
      )}

      {/* ═══ PART 1 ═══ */}
      <PartHeader title="Sales & Contracts" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
        <KPI
          value={String(c.offers.length)}
          label="Offers"
          sub={offersValue > 0 ? money(offersValue) : undefined}
        />
        <KPI
          value={String(c.underContract.length)}
          label="Under Contract"
          sub={ucValue > 0 ? money(ucValue) : undefined}
        />
        <KPI
          value={String(c.closed.count)}
          label="Closed"
          sub={c.closed.volume != null ? money(c.closed.volume) : undefined}
        />
        <KPI value={String(c.hold.count)} label="On Hold" />
      </div>

      {c.underContract.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Under Contract</h3>
          <DealTable rows={c.underContract} dateLabel="Executed" dateField="executedDate" />
        </div>
      )}

      {c.offers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Offers Received</h3>
          <DealTable rows={c.offers} dateLabel="Offer Received" dateField="offerDate" />
          <p className="text-xs text-gray-400 mt-2">
            Net price = offer price + parking + storage + discounts.
          </p>
        </div>
      )}

      <Section title="Inventory by Community">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className={TH}>Community</th>
              <th className={`${TH} text-right`}>Closed</th>
              <th className={`${TH} text-right`}>Under Contract</th>
              <th className={`${TH} text-right`}>Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {report.salesByCommunity.map((com) => {
              const inCommunity = (d: DealDetail) =>
                d.building.toLowerCase() === com.community.toLowerCase();
              const uc = c.underContract.filter(inCommunity).length;
              const closed = c.closedDeals.filter(inCommunity).length;
              return (
                <tr key={com.community}>
                  <td className={`${TD} font-medium text-gray-900`}>{com.community}</td>
                  <td className={`${TD} text-right`}>{closed}</td>
                  <td className={`${TD} text-right`}>{uc}</td>
                  <td className={`${TD} text-right`}>{com.unsoldInventory - uc - closed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {/* ═══ PART 2 ═══ */}
      <PartHeader title="This Week's Activity" subtitle={period} />

      <Section title="Demand">
        <div className="grid grid-cols-3 gap-6">
          <KPI value={String(report.newProspects)} label="New Prospects" />
          <KPI value={String(report.returnProspects)} label="Return Prospects" />
          <KPI value={String(report.visits.total)} label="Visits" />
        </div>
      </Section>

      <Section title="Team Activity">
        <div className="flex flex-wrap gap-x-16 gap-y-4">
          <div>
            <p>
              <span className="text-2xl font-bold tabular-nums">{tp.total}</span>
              <span className="text-gray-500 ml-2">touch points</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {tp.calls} calls · {tp.texts} texts · {tp.emails} emails
            </p>
          </div>
          <div>
            <p>
              <span className="text-2xl font-bold tabular-nums">
                {report.marketingEmails.toLocaleString()}
              </span>
              <span className="text-gray-500 ml-2">marketing emails</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">automated drip emails sent this week</p>
          </div>
        </div>
      </Section>

      <Section title="Visits">
        <RowsTable rows={visitRows} />
      </Section>

      <Section title="New Prospects" subtitle="Leads added this week">
        <RowsTable rows={newRows} />
      </Section>

      <Section title="Returning Prospects" subtitle="Existing contacts who reached back out">
        <RowsTable rows={returnRows} />
      </Section>

      <p className="border-t border-gray-200 pt-4 mt-10 text-xs text-gray-500">
        Confidential — Report prepared by Jacob Hannusch and Carson Haney, MODUS Development
        Services, for {DEVELOPER}.
      </p>
    </div>
  );
}
