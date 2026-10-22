"use client";

import Link from "next/link";
import { FiClock } from "react-icons/fi";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";

export function RecordHistoryLink({ entity, id }: { entity: "Member" | "Event" | "PrayerRequest" | "Ministry" | "Homecell" | "Visitor" | "Content" | "Publication" | "Stream" | "Program" | "ProgramTemplate" | "User" | "Role"; id: string }) {
  const user = useAuthStore((state) => state.user);
  if (!hasRequiredRole(user?.roles ?? [], ["ADMIN"])) return null;
  return <Link href={"/dashboard/audit/" + entity + "/" + encodeURIComponent(id)} className="record-back !mb-0 mt-4"><FiClock aria-hidden="true" />View record history</Link>;
}
