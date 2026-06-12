import type { ResidentialUnit, Designation } from "@/lib/inventory/types";

// ─── Iris — 5025 Mueller Blvd ────────────────────────────────────────────────
// MOCK seed copied from the team Google Sheet (Iris tab).
// Price = "Jervis" (Approved Pricing) when present, else "Original Pricing".
// Beds only in the sheet → baths inferred (1BR→1, 2BR→2).
// No HOA column for Iris → HOA ESTIMATED from sqft (~$0.50/sqft).

function normalizeDesignation(raw: string): Designation {
  if (raw.startsWith("AH")) return "affordable";
  if (raw.startsWith("WF")) return "workforce";
  return "market"; // Market, Market/ADA
}

// [unit, beds, rawDesignation, sqft, originalPrice, jervisPrice(0=blank), views,
//  appliances, cabSize, cabColor, kBacksplash, kCountertop, bTile, bCabinet, bCountertop]
type Row = [
  string, number, string, number, number, number,
  string, string, string, string, string, string, string, string, string
];

const RAW: Row[] = [
  ["201",1,"AH",839,156000,0,"","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White"],
  ["202",1,"AH",655,156000,0,"","Whirlpool","36\"","White","Grey Concrete","Brown","White Marble","White","Light grey"],
  ["203",1,"AH",889,156000,0,"","Whirlpool","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White"],
  ["204",1,"AH",764,156000,0,"","Whirlpool","36\"","White","Grey Concrete","Brown","White Marble","White","Dark Grey"],
  ["205",1,"AH",742,156000,0,"","Whirlpool","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey"],
  ["206",1,"Market/ADA",783,385000,349900,"","Whirlpool","42\"","White","Grey Concrete","Brown","White Marble","White","Dark Grey"],
  ["207",2,"Market",1151,550000,499900,"","Bosch","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Cream"],
  ["208",1,"Market",776,376000,344900,"","Bosch","36\"","Light Grey","Grey Hex","Sparkle Grey","Thin Grey","Light Grey","White"],
  ["209",2,"Market",1290,599000,519900,"","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["210",1,"Market",934,449000,399900,"Wall","Bosch","42\"","White","Grey Concrete","Brown","White Marble","White","Dark Grey"],
  ["211",1,"Market",990,465000,409900,"Wall","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["301",1,"AH",839,156000,0,"","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White"],
  ["302",1,"AH",655,156000,0,"","Whirlpool","36\"","White","Grey Concrete","Brown","White Marble","White","Light grey"],
  ["303",1,"AH",889,156000,0,"","Whirlpool","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White"],
  ["304",1,"AH",764,156000,0,"","Whirlpool","36\"","White","Grey Concrete","Brown","White Marble","White","Dark Grey"],
  ["305",2,"Market",1525,524000,589900,"","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["306",2,"Market",1151,560000,499900,"","Bosch","42\"","Slate Grey (dark)","White Subway Tile","Light grey","Grey Marble","Slate Grey (dark)","Dark Grey"],
  ["307",1,"Market",776,386000,344900,"","Bosch","42\"","Light Grey","Grey Hex","Dark Grey","White Marble","Light Grey","White"],
  ["308",2,"Market",1290,599000,509900,"","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["309",1,"Market",934,450000,399900,"Wall","Bosch","36\"","White","Grey Concrete","Brown","White Marble","White","Dark Grey"],
  ["310",1,"Market",990,465000,409900,"Wall","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["401",1,"WF",839,265000,0,"","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White"],
  ["402",1,"AH",655,156000,0,"","Whirlpool","36\"","White","Grey Concrete","Brown","White Marble","White","Light grey"],
  ["403",1,"WF",889,265000,0,"","Bosch","42\"","Light Grey","Grey Hex","Sparkle Grey","Thin Grey","Light Grey","White"],
  ["404",1,"WF",764,265000,0,"","Whirlpool","36\"","White","White Subway Tile","Dark Grey","Grey Marble","White","Dark Grey"],
  ["405",2,"Market",1525,560000,599900,"","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["406",2,"Market",1151,599000,509900,"","Whirlpool","42\"","Slate Grey (dark)","White Subway Tile","Light grey","Grey Marble","Slate Grey (dark)","Dark Grey"],
  ["407",1,"Market",776,386000,354900,"","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White"],
  ["408",2,"Market",1290,615000,529900,"","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream"],
  ["409",1,"Market",934,465000,409900,"","Bosch","42\"","White","Grey Concrete","Brown","White Marble","White","Dark Grey"],
  ["410",1,"Market",990,510000,439900,"","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Dark Grey"],
];

export const irisUnits: ResidentialUnit[] = RAW.map(
  ([unitNumber, beds, rawDes, sqft, original, jervis, views, appliances, cabinetSize, cabinetColor, kitchenBacksplash, kitchenCountertop, bathroomTile, bathroomCabinet, bathroomCountertop]) => ({
    building: "iris",
    unitNumber,
    floor: Math.floor(Number(unitNumber) / 100),
    beds,
    baths: beds === 2 ? 2 : 1,
    designation: normalizeDesignation(rawDes),
    sqft,
    price: jervis > 0 ? jervis : original,
    hoaFee: Math.round((sqft * 0.5) / 5) * 5, // estimate, ~$0.50/sqft
    hoaEstimated: true,
    status: "active",
    views: views || undefined,
    appliances: appliances || undefined,
    cabinetSize: cabinetSize || undefined,
    cabinetColor: cabinetColor || undefined,
    kitchenBacksplash: kitchenBacksplash || undefined,
    kitchenCountertop: kitchenCountertop || undefined,
    bathroomTile: bathroomTile || undefined,
    bathroomCabinet: bathroomCabinet || undefined,
    bathroomCountertop: bathroomCountertop || undefined,
  })
);
