import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { memberName, type GroupMember } from "@/lib/utils/group-members";
import { readableRecordLabel } from "@/lib/utils/record-details";

type Leader = Pick<GroupMember, "id" | "firstName" | "lastName" | "prefix">;

export function RecordLeadership({ leader, overseer }: { leader?: Leader | null; overseer?: Leader | null }) {
  return <div className="record-leadership">
    <Person role="Leader" person={leader} />
    <Person role="Overseer" person={overseer} />
  </div>;
}

function Person({ role, person }: { role: string; person?: Leader | null }) {
  return <div className="min-w-0">
    <p className="mb-2 text-xs font-medium text-[#6c6257]">{role}</p>
    {person ? <Link href={"/dashboard/members/" + encodeURIComponent(person.id)} className="flex min-h-16 items-center gap-3 rounded-xl border border-[#e7e0d5] p-3 hover:bg-[var(--brand-surface)]">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-link)]">{[person.firstName, person.lastName].map((part) => part?.charAt(0)).join("").toUpperCase()}</span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold wrap-anywhere">{memberName(person)}</span>{person.prefix && <span className="mt-1 block text-xs text-[#6c6257]">{readableRecordLabel(person.prefix)}</span>}</span>
      <FiArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
    </Link> : <p className="record-empty rounded-xl border border-dashed border-[#ded5c8] p-4">No {role.toLowerCase()} assigned.</p>}
  </div>;
}
