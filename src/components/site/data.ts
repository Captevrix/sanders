import home1 from "@/assets/home-1.jpg";
import home2 from "@/assets/home-2.jpg";
import home3 from "@/assets/home-3.jpg";

export const STATUSES = ["For Sale", "Luxury", "On Site", "Special"] as const;
export type Status = (typeof STATUSES)[number];

export const SECTION_TYPES = ["Single Section", "Multi Section"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export type Home = {
  id: string;
  name: string;
  builder: string;
  propertyId: string;
  address: string;
  dateAdded: string;
  image: string;
  photoCount: number;
  statuses: Status[];
  sectionType: SectionType;
  beds: number;
  baths: number;
  sqft: number;
  dimensions: string;
  windZone: "Wind Zone II" | "Wind Zone III";
  features: string[];
  /** Optional — most homes on the lot are quoted, not listed. */
  price?: number;
  description: string;
};

const F = {
  cool: "Central Cooling",
  heat: "Central Heating",
  dining: "Dining Room",
  drywall: "Drywall",
  dualSinks: "Dual Sinks",
  range: "Electric Range",
  family: "Family Room",
  alarm: "Fire Alarm",
  fireplace: "Fire Place",
  tub: "Garden Tub",
  island: "Kitchen Island",
  laundry: "Laundry Room",
  open: "Open Concept",
  pantry: "Pantry",
  shower: "Separate Shower",
  split: "Split Bedrooms",
  utility: "Utility Room With Washer/Dryer Hookups",
  storage: "Ample Storage Throughout",
  vaulted: "Vaulted Ceilings",
  ensuite: "Ensuite",
  bonus: "Bonus Room",
  gourmet: "Gourmet Kitchen",
  ceilings: "8.5' Ceilings",
  desk: "Built-In Desk Area",
  entertainment: "Built-In Entertainment Center",
} as const;

const LOT = "10300 Pensacola Blvd, Pensacola, FL";

export const HOMES: Home[] = [
  {
    id: "truman",
    name: "Truman",
    builder: "Southern Energy",
    propertyId: "RH-11466-home",
    address: LOT,
    dateAdded: "December 8, 2025",
    image: home1,
    photoCount: 19,
    statuses: ["For Sale", "On Site"],
    sectionType: "Single Section",
    beds: 3,
    baths: 2,
    sqft: 1_140,
    dimensions: "16x76",
    windZone: "Wind Zone II",
    features: [
      F.cool,
      F.heat,
      F.dining,
      F.drywall,
      F.dualSinks,
      F.range,
      F.family,
      F.alarm,
      F.island,
      F.laundry,
      F.pantry,
      F.shower,
      F.split,
      F.utility,
    ],
    price: 89_900,
    description:
      "A compact, thoughtfully designed single section built to Southern Energy's Patriot standards — 2x6 floor joists, 8' sidewalls, vinyl siding and Low-E windows. The layout maximizes every square foot, making it a strong first home or a simple downsize.",
  },
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    builder: "Live Oak Homes",
    propertyId: "RH-10921-home",
    address: LOT,
    dateAdded: "April 11, 2025",
    image: home2,
    photoCount: 17,
    statuses: ["For Sale", "On Site", "Special"],
    sectionType: "Single Section",
    beds: 1,
    baths: 1,
    sqft: 596,
    dimensions: "15x40",
    windZone: "Wind Zone II",
    features: [F.cool, F.heat, F.open, F.drywall, F.range, F.laundry, F.storage, F.alarm],
    description:
      "The smallest footprint on the lot and the easiest to site. A true one-bedroom cottage that works as a guest house, a rental, or a low-overhead place of your own on land you already have.",
  },
  {
    id: "anderson",
    name: "Anderson",
    builder: "Southern Energy",
    propertyId: "RH-10877-home",
    address: LOT,
    dateAdded: "March 3, 2025",
    image: home3,
    photoCount: 14,
    statuses: ["For Sale", "On Site"],
    sectionType: "Multi Section",
    beds: 4,
    baths: 2,
    sqft: 1_860,
    dimensions: "28x66",
    windZone: "Wind Zone III",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.island,
      F.pantry,
      F.split,
      F.dualSinks,
      F.tub,
      F.shower,
      F.laundry,
      F.utility,
      F.family,
      F.storage,
      F.drywall,
    ],
    price: 139_500,
    description:
      "Four bedrooms with a genuine split-bedroom layout, a large island kitchen and a master bath with both a garden tub and a separate shower. Our most-requested family floor plan.",
  },
  {
    id: "perdido",
    name: "Perdido",
    builder: "Live Oak Homes",
    propertyId: "RH-11204-home",
    address: LOT,
    dateAdded: "September 19, 2025",
    image: home1,
    photoCount: 22,
    statuses: ["For Sale", "Luxury"],
    sectionType: "Multi Section",
    beds: 3,
    baths: 2,
    sqft: 2_040,
    dimensions: "32x64",
    windZone: "Wind Zone III",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.gourmet,
      F.island,
      F.pantry,
      F.fireplace,
      F.vaulted,
      F.ensuite,
      F.tub,
      F.shower,
      F.dualSinks,
      F.laundry,
      F.utility,
      F.storage,
      F.drywall,
    ],
    price: 164_900,
    description:
      "Our flagship 32-wide. Vaulted ceilings over an open great room, a gourmet kitchen with a full island, and an owner's suite with an ensuite bath at the opposite end of the home.",
  },
  {
    id: "santa-rosa",
    name: "Santa Rosa",
    builder: "Southern Estates",
    propertyId: "RH-11310-home",
    address: LOT,
    dateAdded: "October 27, 2025",
    image: home2,
    photoCount: 16,
    statuses: ["For Sale"],
    sectionType: "Multi Section",
    beds: 3,
    baths: 2,
    sqft: 1_620,
    dimensions: "28x60",
    windZone: "Wind Zone III",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.island,
      F.split,
      F.pantry,
      F.laundry,
      F.utility,
      F.shower,
      F.storage,
    ],
    description:
      "A right-sized double wide for a family of three or four, with an efficient kitchen-to-living flow and bedrooms split to opposite ends for quiet.",
  },
  {
    id: "escambia",
    name: "Escambia",
    builder: "Live Oak Homes",
    propertyId: "RH-11055-home",
    address: LOT,
    dateAdded: "July 2, 2025",
    image: home3,
    photoCount: 12,
    statuses: ["For Sale", "Special"],
    sectionType: "Single Section",
    beds: 2,
    baths: 2,
    sqft: 980,
    dimensions: "16x66",
    windZone: "Wind Zone II",
    features: [F.cool, F.heat, F.open, F.drywall, F.pantry, F.laundry, F.utility, F.shower],
    price: 74_500,
    description:
      "Two bedrooms, two full baths and no wasted hallway. Priced as a current special while it sits on the front row.",
  },
  {
    id: "gulf-breeze",
    name: "Gulf Breeze",
    builder: "Southern Energy",
    propertyId: "RH-11402-home",
    address: LOT,
    dateAdded: "November 14, 2025",
    image: home1,
    photoCount: 20,
    statuses: ["For Sale", "Luxury", "On Site"],
    sectionType: "Multi Section",
    beds: 4,
    baths: 3,
    sqft: 2_280,
    dimensions: "32x72",
    windZone: "Wind Zone III",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.gourmet,
      F.island,
      F.bonus,
      F.fireplace,
      F.entertainment,
      F.ensuite,
      F.tub,
      F.shower,
      F.dualSinks,
      F.split,
      F.laundry,
      F.utility,
      F.storage,
      F.ceilings,
    ],
    description:
      "The largest home on display. Four bedrooms, three full baths, a bonus room and a built-in entertainment wall — with 8.5' ceilings throughout.",
  },
  {
    id: "navarre",
    name: "Navarre",
    builder: "Southern Estates",
    propertyId: "RH-10998-home",
    address: LOT,
    dateAdded: "June 9, 2025",
    image: home2,
    photoCount: 15,
    statuses: ["For Sale"],
    sectionType: "Single Section",
    beds: 3,
    baths: 2,
    sqft: 1_216,
    dimensions: "16x80",
    windZone: "Wind Zone II",
    features: [
      F.cool,
      F.heat,
      F.dining,
      F.island,
      F.split,
      F.pantry,
      F.laundry,
      F.utility,
      F.shower,
      F.storage,
      F.drywall,
    ],
    description:
      "The longest single section we stock. Three bedrooms with a real dining room and an island kitchen — a double-wide feel on a single-wide lot.",
  },
  {
    id: "blackwater",
    name: "Blackwater",
    builder: "Live Oak Homes",
    propertyId: "RH-11128-home",
    address: LOT,
    dateAdded: "August 21, 2025",
    image: home3,
    photoCount: 18,
    statuses: ["For Sale", "On Site"],
    sectionType: "Multi Section",
    beds: 3,
    baths: 2,
    sqft: 1_493,
    dimensions: "28x52",
    windZone: "Wind Zone III",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.island,
      F.pantry,
      F.tub,
      F.shower,
      F.dualSinks,
      F.laundry,
      F.utility,
      F.family,
    ],
    description:
      "A shorter double wide that fits lots where a 66' box will not. Same open living area, same island kitchen, easier to permit and set.",
  },
  {
    id: "milton",
    name: "Milton",
    builder: "Southern Energy",
    propertyId: "RH-10804-home",
    address: LOT,
    dateAdded: "February 12, 2025",
    image: home1,
    photoCount: 11,
    statuses: ["For Sale", "Special"],
    sectionType: "Single Section",
    beds: 3,
    baths: 2,
    sqft: 1_064,
    dimensions: "16x70",
    windZone: "Wind Zone II",
    features: [F.cool, F.heat, F.open, F.range, F.pantry, F.laundry, F.utility, F.split, F.alarm],
    description:
      "Our value three-bedroom. Nothing fancy, everything essential, and the fastest home on the lot to get delivered and set.",
  },
  {
    id: "bayou-ridge",
    name: "Bayou Ridge",
    builder: "Southern Estates",
    propertyId: "RH-11376-home",
    address: LOT,
    dateAdded: "November 2, 2025",
    image: home2,
    photoCount: 21,
    statuses: ["For Sale", "Luxury"],
    sectionType: "Multi Section",
    beds: 5,
    baths: 3,
    sqft: 2_432,
    dimensions: "32x76",
    windZone: "Wind Zone III",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.gourmet,
      F.island,
      F.bonus,
      F.desk,
      F.fireplace,
      F.vaulted,
      F.ensuite,
      F.tub,
      F.shower,
      F.dualSinks,
      F.split,
      F.laundry,
      F.utility,
      F.storage,
      F.dining,
    ],
    description:
      "Five bedrooms, three baths, a bonus room and a built-in desk area. Built for a multi-generation household that wants everyone under one roof without stepping on each other.",
  },
  {
    id: "pine-forest",
    name: "Pine Forest",
    builder: "Live Oak Homes",
    propertyId: "RH-11245-home",
    address: LOT,
    dateAdded: "September 30, 2025",
    image: home3,
    photoCount: 13,
    statuses: ["For Sale"],
    sectionType: "Multi Section",
    beds: 3,
    baths: 2,
    sqft: 1_400,
    dimensions: "24x60",
    windZone: "Wind Zone II",
    features: [
      F.cool,
      F.heat,
      F.open,
      F.island,
      F.pantry,
      F.shower,
      F.laundry,
      F.utility,
      F.storage,
    ],
    description:
      "A 24-wide — narrower than a standard double, so it clears tighter lots and driveways while still giving you a full open living area.",
  },
];

export function getHome(id: string) {
  return HOMES.find((h) => h.id === id);
}

/** All feature names present in inventory, with how many homes have each. */
export function featureCounts() {
  const counts = new Map<string, number>();
  for (const home of HOMES) {
    for (const f of home.features) counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

/** Simple chattel-style estimate: 20 yr term, 8.99% APR, 10% down. */
export function estimateMonthly(price: number, downPct = 0.1, apr = 0.0899, years = 20) {
  const principal = price * (1 - downPct);
  const r = apr / 12;
  const n = years * 12;
  const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment);
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export const PRICED_HOMES = HOMES.filter((h) => typeof h.price === "number");
