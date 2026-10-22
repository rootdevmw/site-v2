import type { Metadata } from "next";
import { HomePage } from "@/components/public/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: "Church of Christ at Red Cross | Blantyre, Malawi" },
  description:
    "Rooted in Christ. Growing together. Join our church family in Blantyre for Sunday worship in English at 7:00 AM or Chichewa at 9:30 AM. Plan your visit.",
};

export default function PublicRootPage() {
  return <HomePage />;
}
