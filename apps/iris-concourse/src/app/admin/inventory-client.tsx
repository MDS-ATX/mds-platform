"use client";

import { Fragment, useMemo, useState } from "react";
import type { Building } from "@/lib/inventory/types";
import {
  type ResidentialUnit,
  type ParkingSpace,
  type StorageUnit,
  type InventoryStatus,
  type Designation,
  type ParkingType,
  STATUS_LABELS,
  STATUS_BADGE,
  DESIGNATION_LABELS,
  DESIGNATION_BADGE,
  ALL_STATUSES,
  ALL_DESIGNATIONS,
  FINISH_FIELDS,
  unitUrl,
} from "@/lib/inventory/types";
import type { BuildingInventory } from "@/lib/inventory/data";
import { CopyControls } from "@/components/admin/copy-controls";

type Section = "units" | "parking" | "storage";

const BUILDINGS: { key: Building; label: string; sub: string }[] = [
  { key: "concourse", label: "Concourse", sub: "3900 Berkman" },
  { key: "iris", label: "Iris", sub: "5025 Mueller Blvd" },
];

const SECTIONS: { key: Section; label: string }[] = [
  { key: "units", label: "Units" },
  { key: "parking", label: "Parking" },
  { key: "storage", label: "Storage" },
];

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function StatusBadge({ status }: { status: InventoryStatus }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function StatusSelect({ value, onChange }: { value: InventoryStatus; onChange: (s: InventoryStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as InventoryStatus)}
      className="rounded-md border border-amber-400 bg-amber-50 px-1.5 py-1 text-[11px] font-medium outline-none focus:border-black"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

const TH = "px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-brand-500 whitespace-nowrap";
const TD = "px-3 py-1 text-[11px] text-brand-700 whitespace-nowrap";

// Parking/storage have few columns — give them more breathing room.
const THP = "px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-brand-500 whitespace-nowrap";
const TDP = "px-5 py-1.5 text-[11px] text-brand-700 whitespace-nowrap";

export function InventoryClient({
  inventory,
}: {
  inventory: Record<Building, BuildingInventory>;
}) {
  const [units, setUnits] = useState<Record<Building, ResidentialUnit[]>>({
    concourse: inventory.concourse.units,
    iris: inventory.iris.units,
  });
  const [parking, setParking] = useState<Record<Building, ParkingSpace[]>>({
    concourse: inventory.concourse.parking,
    iris: inventory.iris.parking,
  });
  const [storage, setStorage] = useState<Record<Building, StorageUnit[]>>({
    concourse: inventory.concourse.storage,
    iris: inventory.iris.storage,
  });

  const [building, setBuilding] = useState<Building>("concourse");
  const [section, setSection] = useState<Section>("units");
  const [editMode, setEditMode] = useState(false);

  // Multi-select filters (empty array = no filter / all).
  const [desigSel, setDesigSel] = useState<string[]>([]);
  const [statusSel, setStatusSel] = useState<string[]>([]);
  const [bedsSel, setBedsSel] = useState<string[]>([]);
  const [finishSel, setFinishSel] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Sorting
  const [sortField, setSortField] = useState<string>("unit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  function handleSort(field: string) {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }
  function sortValue(u: ResidentialUnit, field: string): string | number {
    switch (field) {
      case "unit": return Number(u.unitNumber);
      case "beds": return u.beds;
      case "sqft": return u.sqft;
      case "designation": return DESIGNATION_LABELS[u.designation];
      case "price": return u.price;
      case "hoa": return u.hoaFee ?? 0;
      case "status": return ALL_STATUSES.indexOf(u.status);
      case "notes": return u.notes ?? "";
      default: return (u[field as keyof ResidentialUnit] as string | undefined) ?? "";
    }
  }

  const buildingUnits = units[building];

  const finishOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const { key } of FINISH_FIELDS) {
      const set = new Set<string>();
      for (const u of buildingUnits) {
        const v = u[key] as string | undefined;
        if (v) set.add(v);
      }
      map[key as string] = Array.from(set).sort();
    }
    return map;
  }, [buildingUnits]);

  const filteredUnits = useMemo(() => {
    return buildingUnits.filter((u) => {
      if (statusSel.length && !statusSel.includes(u.status)) return false;
      if (desigSel.length && !desigSel.includes(u.designation)) return false;
      if (bedsSel.length && !bedsSel.includes(String(u.beds))) return false;
      for (const { key } of FINISH_FIELDS) {
        const sel = finishSel[key as string];
        if (sel && sel.length) {
          const v = u[key] as string | undefined;
          if (!v || !sel.includes(v)) return false;
        }
      }
      return true;
    });
  }, [buildingUnits, statusSel, desigSel, bedsSel, finishSel]);

  const sortedUnits = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filteredUnits].sort((a, b) => {
      const av = sortValue(a, sortField);
      const bv = sortValue(b, sortField);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUnits, sortField, sortDir]);

  const selectedUnits = useMemo(
    () => buildingUnits.filter((u) => selected.has(`${u.building}-${u.unitNumber}`)),
    [buildingUnits, selected]
  );

  const counts = useMemo(() => {
    const c: Record<InventoryStatus, number> = { active: 0, pending: 0, hold: 0, sold: 0 };
    for (const u of buildingUnits) c[u.status]++;
    return c;
  }, [buildingUnits]);

  function updateUnit(unitNumber: string, patch: Partial<ResidentialUnit>) {
    setUnits((prev) => ({
      ...prev,
      [building]: prev[building].map((u) => (u.unitNumber === unitNumber ? { ...u, ...patch } : u)),
    }));
  }
  function updateParkingStatus(number: string, status: InventoryStatus) {
    setParking((prev) => ({
      ...prev,
      [building]: prev[building].map((p) => (p.number === number ? { ...p, status } : p)),
    }));
  }
  function updateStorageStatus(number: string, status: InventoryStatus) {
    setStorage((prev) => ({
      ...prev,
      [building]: prev[building].map((s) => (s.number === number ? { ...s, status } : s)),
    }));
  }

  function toggleSelect(unitNumber: string) {
    const key = `${building}-${unitNumber}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  function toggleSelectAll() {
    const keys = filteredUnits.map((u) => `${u.building}-${u.unitNumber}`);
    const allSelected = keys.every((k) => selected.has(k));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
  }
  const allFilteredSelected =
    filteredUnits.length > 0 && filteredUnits.every((u) => selected.has(`${u.building}-${u.unitNumber}`));

  function clearFilters() {
    setDesigSel([]);
    setStatusSel([]);
    setBedsSel([]);
    setFinishSel({});
  }
  const activeFilterCount =
    (desigSel.length ? 1 : 0) +
    (statusSel.length ? 1 : 0) +
    (bedsSel.length ? 1 : 0) +
    Object.values(finishSel).filter((v) => v && v.length).length;

  // Parking / storage multi-select filters
  const [parkStatusSel, setParkStatusSel] = useState<string[]>([]);
  const [parkTypeSel, setParkTypeSel] = useState<string[]>([]);
  const [storStatusSel, setStorStatusSel] = useState<string[]>([]);

  const buildingParking = parking[building].filter(
    (p) =>
      (parkStatusSel.length === 0 || parkStatusSel.includes(p.status)) &&
      (parkTypeSel.length === 0 || parkTypeSel.includes(p.type))
  );
  const buildingStorage = storage[building].filter(
    (s) => storStatusSel.length === 0 || storStatusSel.includes(s.status)
  );

  const statusOptions = ALL_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }));
  const designationOptions = ALL_DESIGNATIONS.map((d) => ({ value: d, label: DESIGNATION_LABELS[d] }));
  const parkingTypeOptions: { value: ParkingType; label: string }[] = [
    { value: "covered", label: "Covered" },
    { value: "uncovered", label: "Uncovered" },
  ];

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-black">Sales Inventory</h1>
            <p className="text-xs uppercase tracking-widest text-brand-600">Concourse &amp; Iris — Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/open-house"
              className="rounded-md border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Open House Sign-In
            </a>
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                editMode ? "border-amber-400 bg-amber-100 text-amber-900" : "border-brand-200 text-brand-700 hover:bg-brand-50"
              }`}
            >
              {editMode ? "✓ Done editing" : "✎ Edit"}
            </button>
            <button onClick={handleLogout} className="rounded-md border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50">
              Sign out
            </button>
          </div>
        </div>

        <div className="flex gap-1 px-6">
          {BUILDINGS.map((b) => (
            <button
              key={b.key}
              onClick={() => {
                setBuilding(b.key);
                setSelected(new Set());
              }}
              className={`-mb-px border-b-2 px-5 py-3 text-left ${
                building === b.key ? "border-black" : "border-transparent hover:border-brand-200"
              }`}
            >
              <div className={`text-sm font-semibold ${building === b.key ? "text-black" : "text-brand-600"}`}>{b.label}</div>
              <div className="text-[11px] text-brand-500">{b.sub}</div>
            </button>
          ))}
        </div>
      </header>

      {editMode && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs font-medium text-amber-900">
          Edit mode is on — status dropdowns are unlocked. Click “Done editing” when finished.
        </div>
      )}

      <main className="w-full px-6 py-6">
        <div className="mb-5 flex gap-1 rounded-lg bg-brand-100 p-1">
          {SECTIONS.map((s) => {
            const n =
              s.key === "units" ? units[building].length : s.key === "parking" ? parking[building].length : storage[building].length;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  section === s.key ? "bg-white text-black shadow-sm" : "text-brand-600 hover:text-black"
                }`}
              >
                {s.label} <span className="text-brand-400">({n})</span>
              </button>
            );
          })}
        </div>

        {section === "units" && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ALL_STATUSES.map((s) => (
                <div key={s} className="rounded-lg border border-brand-200 bg-white p-4">
                  <div className="text-2xl font-bold text-black">{counts[s]}</div>
                  <div className="text-xs uppercase tracking-wide text-brand-500">{STATUS_LABELS[s]}</div>
                </div>
              ))}
            </div>

            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-end gap-3">
                <Filter label="Designation">
                  <MultiSelect options={designationOptions} selected={desigSel} onChange={setDesigSel} />
                </Filter>
                <Filter label="Status">
                  <MultiSelect options={statusOptions} selected={statusSel} onChange={setStatusSel} />
                </Filter>
                <Filter label="Beds">
                  <MultiSelect
                    options={[
                      { value: "1", label: "1 Bed" },
                      { value: "2", label: "2 Bed" },
                    ]}
                    selected={bedsSel}
                    onChange={setBedsSel}
                  />
                </Filter>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="rounded-md border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
                >
                  {showFilters ? "Hide" : "More"} filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="py-1.5 text-sm text-brand-500 underline hover:text-black">
                    Clear
                  </button>
                )}
              </div>
              <CopyControls selectedUnits={selectedUnits} />
            </div>

            {showFilters && (
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-brand-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-4">
                {FINISH_FIELDS.map(({ key, label }) => {
                  const opts = finishOptions[key as string] ?? [];
                  if (opts.length === 0) return null;
                  return (
                    <Filter key={key as string} label={label}>
                      <MultiSelect
                        options={opts.map((o) => ({ value: o, label: o }))}
                        selected={finishSel[key as string] ?? []}
                        onChange={(vals) => setFinishSel((prev) => ({ ...prev, [key as string]: vals }))}
                      />
                    </Filter>
                  );
                })}
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-brand-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-200 bg-brand-50">
                    <th className={TH}>
                      <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} aria-label="Select all" />
                    </th>
                    <SortHeader field="unit" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Unit</SortHeader>
                    <SortHeader field="beds" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Bd/Ba</SortHeader>
                    <SortHeader field="sqft" sortField={sortField} sortDir={sortDir} onSort={handleSort}>SqFt</SortHeader>
                    <SortHeader field="designation" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Desig.</SortHeader>
                    <SortHeader field="price" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Price</SortHeader>
                    <SortHeader field="hoa" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>HOA</SortHeader>
                    {FINISH_FIELDS.map(({ key, label }) => (
                      <Fragment key={key as string}>
                        <SortHeader field={key as string} sortField={sortField} sortDir={sortDir} onSort={handleSort}>{label}</SortHeader>
                        {key === "views" && (
                          <SortHeader field="notes" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Notes</SortHeader>
                        )}
                      </Fragment>
                    ))}
                    <SortHeader field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Status</SortHeader>
                  </tr>
                </thead>
                <tbody>
                  {sortedUnits.map((u) => {
                    const key = `${u.building}-${u.unitNumber}`;
                    return (
                      <tr key={key} className="border-b border-brand-100 last:border-0 hover:bg-brand-50">
                        <td className={TD}>
                          <input
                            type="checkbox"
                            checked={selected.has(key)}
                            onChange={() => toggleSelect(u.unitNumber)}
                            aria-label={`Select ${u.unitNumber}`}
                          />
                        </td>
                        <td className={`${TD} font-semibold`}>
                          <a
                            href={unitUrl(u.building, u.unitNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black underline decoration-brand-300 underline-offset-2 hover:text-brand-600"
                          >
                            {u.unitNumber}
                          </a>
                        </td>
                        <td className={TD}>
                          {u.beds}/{u.baths}
                        </td>
                        <td className={TD}>{u.sqft.toLocaleString()}</td>
                        <td className={TD}>
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${DESIGNATION_BADGE[u.designation]}`}>
                            {DESIGNATION_LABELS[u.designation]}
                          </span>
                        </td>
                        <td className={`${TD} text-right font-medium text-black`}>{fmtMoney(u.price)}</td>
                        <td className={`${TD} text-right`}>
                          {u.hoaFee != null ? `$${u.hoaFee.toLocaleString()}` : "—"}
                          {u.hoaEstimated ? "*" : ""}
                        </td>
                        {FINISH_FIELDS.map(({ key: fk }) => (
                          <Fragment key={fk as string}>
                            <td className={TD}>{(u[fk] as string | undefined) ?? "—"}</td>
                            {fk === "views" && (
                              <td className="px-2 py-1.5">
                                <input
                                  type="text"
                                  value={u.notes ?? ""}
                                  onChange={(e) => updateUnit(u.unitNumber, { notes: e.target.value })}
                                  placeholder="Add note…"
                                  className="w-32 rounded border border-brand-200 px-1.5 py-0.5 text-[11px] outline-none focus:border-black"
                                />
                              </td>
                            )}
                          </Fragment>
                        ))}
                        <td className={TD}>
                          {editMode ? (
                            <StatusSelect value={u.status} onChange={(s) => updateUnit(u.unitNumber, { status: s })} />
                          ) : (
                            <StatusBadge status={u.status} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUnits.length === 0 && (
                    <tr>
                      <td colSpan={9 + FINISH_FIELDS.length} className="px-3 py-8 text-center text-sm text-brand-500">
                        No units match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-brand-400">
              Unit numbers link to the live residence page. * HOA estimated (Iris). Turn on Edit to change a status. Copy only
              includes the units you check. Status/notes are saved in-app for this preview (mock).
            </p>
            {building === "concourse" && (
              <figure className="mt-8">
                <figcaption className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-500">
                  Concourse — Site Plan
                </figcaption>
                <object
                  data="/images/site-plan/Site%20Plan%20-%20Concourse%20.pdf"
                  type="application/pdf"
                  className="h-[700px] w-full rounded-lg border border-brand-200 bg-white"
                >
                  <p className="p-4 text-sm text-brand-500">
                    <a className="underline" href="/images/site-plan/Site%20Plan%20-%20Concourse%20.pdf" target="_blank" rel="noopener noreferrer">
                      Open the Concourse site plan ↗
                    </a>
                  </p>
                </object>
              </figure>
            )}
          </>
        )}

        {section === "parking" && (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <Filter label="Type">
                <MultiSelect options={parkingTypeOptions} selected={parkTypeSel} onChange={setParkTypeSel} />
              </Filter>
              <Filter label="Status">
                <MultiSelect options={statusOptions} selected={parkStatusSel} onChange={setParkStatusSel} />
              </Filter>
            </div>
            <div className="w-fit max-w-full overflow-x-auto rounded-lg border border-brand-200 bg-white">
              <table className="w-auto">
                <thead>
                  <tr className="border-b border-brand-200 bg-brand-50">
                    <th className={THP}>Space</th>
                    <th className={THP}>Type</th>
                    <th className={`${THP} text-right`}>Price</th>
                    <th className={THP}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {buildingParking.map((p) => (
                    <tr key={p.number} className="border-b border-brand-100 last:border-0 hover:bg-brand-50">
                      <td className={`${TDP} font-semibold text-black`}>{p.number}</td>
                      <td className={`${TDP} capitalize`}>{p.type}</td>
                      <td className={`${TDP} text-right font-medium text-black`}>{fmtMoney(p.price)}</td>
                      <td className={TDP}>
                        {editMode ? (
                          <StatusSelect value={p.status} onChange={(s) => updateParkingStatus(p.number, s)} />
                        ) : (
                          <StatusBadge status={p.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {building === "concourse" && (
              <figure className="mt-8">
                <figcaption className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-500">
                  Concourse Parking Map
                </figcaption>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/parking/Concourse%20Parking%20Map.png"
                  alt="Concourse Parking Map"
                  className="w-full max-w-5xl rounded-lg border border-brand-200 bg-white"
                />
              </figure>
            )}
          </>
        )}

        {section === "storage" && (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <Filter label="Status">
                <MultiSelect options={statusOptions} selected={storStatusSel} onChange={setStorStatusSel} />
              </Filter>
            </div>
            <div className="w-fit max-w-full overflow-x-auto rounded-lg border border-brand-200 bg-white">
              <table className="w-auto">
                <thead>
                  <tr className="border-b border-brand-200 bg-brand-50">
                    <th className={THP}>Unit</th>
                    <th className={`${THP} text-right`}>Price</th>
                    <th className={THP}>Status</th>
                    <th className={THP}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {buildingStorage.map((s) => (
                    <tr key={s.number} className="border-b border-brand-100 last:border-0 hover:bg-brand-50">
                      <td className={`${TDP} font-semibold text-black`}>{s.number}</td>
                      <td className={`${TDP} text-right font-medium text-black`}>
                        {s.price > 0 ? fmtMoney(s.price) : "—"}
                      </td>
                      <td className={TDP}>
                        {editMode ? (
                          <StatusSelect value={s.status} onChange={(st) => updateStorageStatus(s.number, st)} />
                        ) : (
                          <StatusBadge status={s.status} />
                        )}
                      </td>
                      <td className={TDP}>{s.note ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {building === "iris" ? (
              <p className="mt-2 text-xs text-brand-400">
                Iris storage is placeholder (mock) — replace with real units/prices when available.
              </p>
            ) : (
              <figure className="mt-8">
                <figcaption className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-500">
                  Concourse Storage Map
                </figcaption>
                <object
                  data="/images/Storage/Storage%20and%20Pricing.pdf#page=1&view=Fit"
                  type="application/pdf"
                  className="h-[700px] w-full rounded-lg border border-brand-200 bg-white"
                >
                  <p className="p-4 text-sm text-brand-500">
                    <a className="underline" href="/images/Storage/Storage%20and%20Pricing.pdf" target="_blank" rel="noopener noreferrer">
                      Open the Concourse storage map ↗
                    </a>
                  </p>
                </object>
              </figure>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SortHeader({
  field,
  sortField,
  sortDir,
  onSort,
  align,
  children,
}: {
  field: string;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (f: string) => void;
  align?: "right";
  children: React.ReactNode;
}) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`${TH} cursor-pointer select-none hover:text-black ${align === "right" ? "text-right" : ""}`}
    >
      <span className={`inline-flex items-center gap-0.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {children}
        <span className={active ? "text-black" : "text-brand-300"}>{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
      </span>
    </th>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-brand-500">{label}</div>
      {children}
    </div>
  );
}

function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const summary =
    selected.length === 0
      ? "All"
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} selected`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[8rem] items-center justify-between gap-2 rounded-md border border-brand-200 bg-white px-2 py-1.5 text-sm text-brand-800 outline-none hover:border-brand-300 focus:border-black"
      >
        <span className="truncate">{summary}</span>
        <svg className="h-3.5 w-3.5 shrink-0 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 max-h-64 min-w-full overflow-auto rounded-md border border-brand-200 bg-white p-1 shadow-lg">
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="mb-1 w-full rounded px-2 py-1 text-left text-xs text-brand-500 hover:bg-brand-50"
              >
                Clear selection
              </button>
            )}
            {options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded px-2 py-1 text-sm hover:bg-brand-50">
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
