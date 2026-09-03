import home1 from "@/assets/home-1.jpg";
import home2 from "@/assets/home-2.jpg";
import home3 from "@/assets/home-3.jpg";

export const STATUSES = ["For Sale", "Luxury", "On Site", "Special"] as const;
export type Status = (typeof STATUSES)[number];

export const SECTION_TYPES = ["Single Section", "Multi Section"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const WIND_ZONES = ["Wind Zone II", "Wind Zone III"] as const;

export const LOT = "10300 Pensacola Blvd, Pensacola, FL";

/** Stock photography that ships with the app, referenced by key from the database. */
export const STOCK_IMAGES: Record<string, string> = {
  "home-1": home1,
  "home-2": home2,
  "home-3": home3,
};

/** Turn a stored cover image value into something an <img src> can use. */
export function resolveImage(value: string | null | undefined): string {
  if (!value) return home1;
  if (value.startsWith("http") || value.startsWith("/") || value.startsWith("data:")) return value;
  return STOCK_IMAGES[value] ?? home1;
}

export type Home = {
  id: string;
  name: string;
  builder: string;
  propertyId: string;
  address: string;
  dateAdded: string;
  /** Display-ready cover image URL. */
  image: string;
  /** Raw stored cover image value (stock key or URL). */
  coverImage: string;
  photoCount: number;
  statuses: string[];
  sectionType: string;
  beds: number;
  baths: number;
  sqft: number;
  dimensions: string;
  windZone: string;
  features: string[];
  /** Optional: most homes on the lot are quoted, not listed. */
  price?: number;
  description: string;
  published: boolean;
  /** Extra gallery photos (signed URLs) uploaded by staff. */
  photos: string[];
  /** Optional 360/Matterport tour embed URL. */
  virtualTourUrl: string;
  /** Optional floor plan drawing (image URL). */
  floorPlanUrl: string;
};


export type HomeRow = {
  id: string;
  name: string;
  builder: string;
  property_id: string;
  address: string;
  date_added: string;
  cover_image: string | null;
  photo_count: number;
  statuses: string[];
  section_type: string;
  beds: number;
  baths: number;
  sqft: number;
  dimensions: string;
  wind_zone: string;
  features: string[];
  price: number | null;
  description: string;
  published: boolean;
  virtual_tour_url?: string | null;
  floor_plan_url?: string | null;
};


const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDateAdded(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

export function mapHomeRow(row: HomeRow, photos: string[] = []): Home {
  return {
    id: row.id,
    name: row.name,
    builder: row.builder,
    propertyId: row.property_id,
    address: row.address,
    dateAdded: formatDateAdded(row.date_added),
    image: photos[0] ?? resolveImage(row.cover_image),
    coverImage: row.cover_image ?? "",
    photoCount: photos.length > 0 ? photos.length : row.photo_count,
    statuses: row.statuses ?? [],
    sectionType: row.section_type,
    beds: row.beds,
    baths: Number(row.baths),
    sqft: row.sqft,
    dimensions: row.dimensions,
    windZone: row.wind_zone,
    features: row.features ?? [],
    ...(row.price != null ? { price: row.price } : {}),
    description: row.description,
    published: row.published,
    photos,
    virtualTourUrl: row.virtual_tour_url ?? "",
    floorPlanUrl: row.floor_plan_url ?? "",

  };
}

/** Every feature name present in a set of homes, with how many homes have each. */
export function featureCounts(homes: Home[]) {
  const counts = new Map<string, number>();
  for (const home of homes) {
    for (const f of home.features) counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

/** The standard feature checklist offered in the listing editor. */
export const FEATURE_LIBRARY = [
  "8.5' Ceilings",
  "Ample Storage Throughout",
  "Bonus Room",
  "Built-In Desk Area",
  "Built-In Entertainment Center",
  "Central Cooling",
  "Central Heating",
  "Dining Room",
  "Drywall",
  "Dual Sinks",
  "Electric Range",
  "Ensuite",
  "Family Room",
  "Fire Alarm",
  "Fire Place",
  "Garden Tub",
  "Gourmet Kitchen",
  "Kitchen Island",
  "Laundry Room",
  "Open Concept",
  "Pantry",
  "Separate Shower",
  "Split Bedrooms",
  "Utility Room With Washer/Dryer Hookups",
  "Vaulted Ceilings",
] as const;

/** Simple chattel-style estimate: 20 yr term, 8.99% APR, 10% down. */
export function estimateMonthly(price: number, downPct = 0.1, apr = 0.0899, years = 20) {
  const principal = price * (1 - downPct);
  const r = apr / 12;
  const n = years * 12;
  const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment);
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export type HomesSearch = {
  q: string;
  status: string;
  type: string;
  beds: number;
  features: string[];
  maxPayment: number;
  /** Only homes physically on the Pensacola lot right now. */
  onSite: boolean;
};

export const HOMES_SEARCH_DEFAULTS: HomesSearch = {
  q: "",
  status: "All",
  type: "All",
  beds: 0,
  features: [],
  maxPayment: 0,
  onSite: false,
};

/** A home is "on our lot" when staff tag it On Site. */
export const isOnSite = (home: Home) => home.statuses.includes("On Site");

/** Build a complete /homes search object from a partial override. */
export const homesSearch = (patch: Partial<HomesSearch> = {}): HomesSearch => ({
  ...HOMES_SEARCH_DEFAULTS,
  ...patch,
});

/** The photo order Sanders wants on every listing gallery. */
export const PHOTO_ORDER_HINT =
  "Living room, kitchen, master bedroom and bath, additional bedrooms, additional baths, laundry, then exterior.";

/** Legacy WordPress slugs that changed when a home was renamed. */
export const LEGACY_SLUGS: Record<string, string> = {
  delight: "dogwood",
};
