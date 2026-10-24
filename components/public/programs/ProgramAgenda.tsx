import {
  publicProgramPerson,
  publicProgramTime,
  type PublicProgram,
} from "@/lib/utils/public-programs";
import { prepareMessageBody } from "@/lib/utils/public-message-body";

export function ProgramAgenda({ program }: { program: PublicProgram }) {
  if (!program.items.length)
    return (
      <div className="mt-7 rounded-2xl border border-[var(--public-line)] bg-white p-6">
        <h3 className="public-display text-2xl">
          The schedule is still to come.
        </h3>
        <p className="mt-4 text-base leading-8 text-[var(--public-muted)]">
          Activities have not been added to this program yet. Please ask the
          church team about the planned order.
        </p>
      </div>
    );
  return (
    <ol
      aria-label="Activities in planned order"
      className="mt-7 divide-y divide-[var(--public-line)] border-y border-[var(--public-line)]"
    >
      {program.items.map((item, index) => {
        const time = publicProgramTime(item.time),
          person = publicProgramPerson(item),
          description = prepareMessageBody(item.description || "").text;
        return (
          <li
            key={item.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[2rem_6rem_minmax(0,1fr)] sm:gap-x-5"
          >
            <span
              aria-hidden="true"
              className="public-display text-2xl text-[var(--public-muted)]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 text-sm font-semibold leading-7 wrap-anywhere">
              {time.dateTime ? (
                <time dateTime={program.date + "T" + time.dateTime + "+02:00"}>
                  {time.label}
                </time>
              ) : (
                time.label
              )}
            </div>
            <div className="col-start-2 mt-2 min-w-0 sm:col-start-3 sm:row-start-1 sm:mt-0">
              <h3 className="text-lg font-semibold leading-7 wrap-anywhere">
                {item.title.trim() || "Program activity"}
              </h3>
              {description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                  {description}
                </p>
              )}
              {person && (
                <p className="mt-3 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                  Led by{" "}
                  <span className="font-medium text-[var(--public-ink)]">
                    {person}
                  </span>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
