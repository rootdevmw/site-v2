import type { Metadata } from "next";
import { Sail2027Page } from "@/components/public/sail-2027/Sail2027Page";
import { sail2027 } from "@/config/sail-2027";

export const metadata: Metadata = {
  title: {
    absolute: "SAIL 2027 | Southern Africa International Lectureship, Malawi",
  },
  description:
    "Gather in Malawi for SAIL 2027, 26–28 March. Register individually or as a group by 31 December 2026. Find registration fees, payment details and enquiries.",
  alternates: { canonical: "/sail-2027" },
  openGraph: {
    title: "SAIL 2027 · Malawi · 26–28 March",
    description:
      "Southern Africa International Lectureship. Register by 31 December 2026.",
    url: "/sail-2027",
    type: "website",
    images: [
      {
        url: sail2027.logo,
        width: 1200,
        height: 1200,
        alt: "SAIL 2027, Church of Christ Malawi",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SAIL 2027 · Malawi",
    images: [sail2027.logo],
  },
};

export default function Page() {
  return <Sail2027Page />;
}
