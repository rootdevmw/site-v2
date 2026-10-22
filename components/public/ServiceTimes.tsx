import { combinedService, sundayServices } from "@/config/church";

export function ServiceTimes({ dark = false }: { dark?: boolean }) {
  return (
    <div>
      <dl className="space-y-4">
        {sundayServices.map((service) => (
          <div key={service.language} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <dt className={dark ? "text-sm text-stone-300" : "text-sm text-[var(--public-muted)]"}>
              {service.language} service
            </dt>
            <dd className="text-sm font-semibold tabular-nums">{service.time} – {service.endTime}</dd>
          </div>
        ))}
      </dl>
      <p className={`mt-5 text-sm leading-6 ${dark ? "text-stone-300" : "text-[var(--public-muted)]"}`}>
        {combinedService.note}
      </p>
      <p className={`mt-2 text-xs ${dark ? "text-stone-400" : "text-[var(--public-muted)]"}`}>All times are local to Malawi.</p>
    </div>
  );
}
