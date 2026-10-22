import type { Metadata } from "next";
import { HomePage } from "@/components/public/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: "Church of Christ at Red Cross | Blantyre, Malawi" },
  description:
    "A New Testament congregation in Blantyre, Malawi, sharing the gospel of Jesus Christ. Discover our faith and story, and join us for Sunday worship.",
};

export default function PublicRootPage() {
  return <HomePage />;
}
