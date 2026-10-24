import Link from "next/link";
import type { ProgramDisplay } from "../types/programDisplay.types";
import { getOrderedProgramItems, getProgramPerson, getProgramTime } from "@/lib/utils/program-records";

export function ProgramDetails({ program, emptyMessage = "No activities have been added. Edit the program to plan its order of service." }: { program: ProgramDisplay; emptyMessage?: string }) {
  const items = getOrderedProgramItems(program.items);
  if (!items.length) return <p className="record-empty">{emptyMessage}</p>;

  return <ol className="record-program-agenda" role="list" aria-label="Activities in planned sequence">
    {items.map((item, index) => {
      const time = getProgramTime(item.time);
      const person = getProgramPerson(item);
      return <li key={item.id ?? index} className="record-program-item">
        <span className="record-program-position" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <h3>{item.title || "Untitled activity"}</h3>
          {item.description?.trim() && <p>{item.description}</p>}
          <dl className="record-program-meta">
            <div><dt>Time</dt><dd>{time.dateTime ? <time dateTime={time.dateTime}>{time.label}</time> : time.label}</dd></div>
            <div><dt>Responsible person</dt><dd>{person.id ? <Link href={"/dashboard/members/" + encodeURIComponent(person.id)}>{person.name}</Link> : person.name}</dd></div>
          </dl>
        </div>
      </li>;
    })}
  </ol>;
}
