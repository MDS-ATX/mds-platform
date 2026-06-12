import type { ResidentialUnit, Designation } from "@/lib/inventory/types";

// ─── Concourse — 3900 Berkman ────────────────────────────────────────────────
// MOCK seed copied from the team Google Sheet (Concourse tab).
// Price = "Approved Pricing - Apr 30". HOA = "HOA Fee" (monthly).
// Designations: AH→affordable, WF→workforce, Market/Market*→market.

function normalizeDesignation(raw: string): Designation {
  if (raw.startsWith("AH")) return "affordable";
  if (raw.startsWith("WF")) return "workforce";
  return "market"; // Market, Market*
}

// [unit, beds, baths, rawDesignation, sqft, price, hoa, views, appliances,
//  cabSize, cabColor, kBacksplash, kCountertop, bTile, bCabinet, bCountertop, notes]
type Row = [
  string, number, number, string, number, number, number,
  string, string, string, string, string, string, string, string, string, string
];

const RAW: Row[] = [
  ["201",1,1,"AH",616,156000,236,"ATC Tower","Whirlpool","42\"","Black","Grey Concrete","Light grey","Dark Grey Spec","Black","Cream",""],
  ["202",1,1,"Market",617,284900,354,"ATC Tower","Whirlpool","42\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey","MLS (on hold for buyer)"],
  ["203",2,2,"Market",933,444900,486,"ATC Tower","Bosch","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["204",1,1,"AH",543,156000,219,"PARKING","Whirlpool","36\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["205",1,1,"AH",544,156000,218,"PARKING","Whirlpool","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Dark Grey Spec","Slate Grey (dark)","Dark Grey",""],
  ["206",1,1,"AH",546,156000,222,"PARKING","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["207",1,1,"Market",536,244900,323,"PARKING","Whirlpool","36\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["208",1,1,"Market*",508,194400,308,"PARKING","Whirlpool","36\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey","Loss Leader"],
  ["209",1,1,"Market*",600,239100,354,"PARKING","Whirlpool","42\"","White","Grey Concrete","Brown","White Marble","TBD","TBD","Loss Leader"],
  ["210",1,1,"AH",655,156000,244,"PARKING","Whirlpool","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey",""],
  ["211",1,1,"AH",514,156000,206,"PARKING","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["212",1,1,"AH",497,156000,208,"PARKING","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream",""],
  ["213",2,2,"Market",910,424900,477,"MCCURDY","Bosch","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White","MLS"],
  ["214",1,1,"AH",664,156000,247,"MCCURDY","Whirlpool","36\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["215",1,1,"WF",664,268649,247,"MCCURDY","Whirlpool","36\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream",""],
  ["216",2,2,"Market*",910,396500,475,"Berkman/Mccurdy","Bosch","42\"","Slate Grey (dark)","White Subway Tile","Light grey","Grey Marble","Slate Grey (dark)","Light grey","Loss Leader"],
  ["217",1,1,"Market",763,344900,404,"ATC Tower","Bosch","42\"","Black","Grey Zigzag","Blue Grey","Dark Grey Spec","Black","Cream",""],
  ["301",1,1,"Market",616,289900,353,"ATC Tower","Bosch","42\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["302",1,1,"Market",617,289900,354,"ATC Tower","Whirlpool","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey",""],
  ["303",2,2,"Market",933,449900,486,"ATC Tower","Bosch","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["304",1,1,"AH",543,156000,219,"UT TOWER","Whirlpool","36\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey",""],
  ["305",1,1,"AH",544,156000,218,"Downtown","Bosch","42\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["306",1,1,"Market",546,259900,328,"Downtown","Whirlpool","36\"","Black","Grey Zigzag","Blue Grey","Grey Marble","Black","Cream",""],
  ["307",1,1,"Market",536,249900,323,"Downtown","Whirlpool","36\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["308",1,1,"Market",508,239900,308,"PARKING","Whirlpool","36\"","Slate Grey (dark)","TBD","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey",""],
  ["309",1,1,"Market",600,279900,354,"PARKING","Bosch","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["310",1,1,"WF",655,268649,244,"Mueller (north)","Whirlpool","42\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["311",1,1,"AH",514,156000,206,"Mueller (north)","Whirlpool","36\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["312",1,1,"AH",497,156000,208,"Mueller (north)","Bosch","42\"","White","Grey Concrete","Brown","Grey Marble","White","Dark Grey",""],
  ["313",2,2,"Market",910,434900,477,"Downtown/Capitol","Bosch","42\"","Light Grey","Grey Hex","Dark Grey","Thin Grey","Light Grey","White",""],
  ["314",1,1,"Market",664,314900,374,"MCCURDY","Whirlpool","36\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream",""],
  ["315",1,1,"Market",664,314900,374,"MCCURDY","Whirlpool","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey",""],
  ["316",2,2,"Market",910,434900,475,"Berkman","Bosch","42\"","Black","Grey Zigzag","Light grey","Dark Grey Spec","Black","Cream",""],
  ["317",1,1,"Market",763,349900,404,"ATC Tower","Bosch","42\"","Slate Grey (dark)","White Subway Tile","Blue Grey","Grey Marble","Slate Grey (dark)","Dark Grey",""],
];

export const concourseUnits: ResidentialUnit[] = RAW.map(
  ([unitNumber, beds, baths, rawDes, sqft, price, hoaFee, views, appliances, cabinetSize, cabinetColor, kitchenBacksplash, kitchenCountertop, bathroomTile, bathroomCabinet, bathroomCountertop, notes]) => ({
    building: "concourse",
    unitNumber,
    floor: Math.floor(Number(unitNumber) / 100),
    beds,
    baths,
    designation: normalizeDesignation(rawDes),
    sqft,
    price,
    hoaFee,
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
    notes: notes || undefined,
  })
);
