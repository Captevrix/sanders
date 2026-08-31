import home1 from "@/assets/home-1.jpg";
import home2 from "@/assets/home-2.jpg";
import home3 from "@/assets/home-3.jpg";

export type Home = {
  id: string;
  name: string;
  maker: string;
  image: string;
  status: "On our lot now" | "Arriving soon" | "On display";
  sections: "Single section" | "Multi section";
  beds: number;
  baths: number;
  sqft: number;
  dimensions: string;
  price: number;
  windZone: "Wind Zone II" | "Wind Zone III";
};

export const HOMES: Home[] = [
  {
    id: "bayou-16",
    name: "Bayou 16",
    maker: "Live Oak Homes",
    image: home1,
    status: "On our lot now",
    sections: "Single section",
    beds: 3,
    baths: 2,
    sqft: 1_180,
    dimensions: "16 x 76",
    price: 89_900,
    windZone: "Wind Zone II",
  },
  {
    id: "pensacola-28",
    name: "Pensacola 28",
    maker: "Southern Estates",
    image: home2,
    status: "On display",
    sections: "Multi section",
    beds: 4,
    baths: 2,
    sqft: 1_860,
    dimensions: "28 x 66",
    price: 139_500,
    windZone: "Wind Zone III",
  },
  {
    id: "perdido-32",
    name: "Perdido 32",
    maker: "Live Oak Homes",
    image: home3,
    status: "Arriving soon",
    sections: "Multi section",
    beds: 3,
    baths: 2,
    sqft: 2_040,
    dimensions: "32 x 64",
    price: 164_900,
    windZone: "Wind Zone III",
  },
];

/** Simple chattel-style estimate: 20 yr term, 8.99% APR, 10% down. */
export function estimateMonthly(price: number, downPct = 0.1, apr = 0.0899, years = 20) {
  const principal = price * (1 - downPct);
  const r = apr / 12;
  const n = years * 12;
  const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment);
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
