import Link from "next/link";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import {
  churchContent,
  churchHistory,
  faithAndPractice,
  missionObjectives,
  worshipPractices,
} from "@/config/church-content";

export function ChurchPurpose() {
  return (
    <section
      id="our-purpose"
      tabIndex={-1}
      className="scroll-mt-32 border-y border-[var(--public-line)] bg-[var(--brand-soft)]"
    >
      <div className="public-container public-section">
        <p className="public-eyebrow">Our mission and vision</p>
        <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0">
            <h2 className="public-display text-3xl leading-tight sm:text-4xl">
              Salvation in Christ.
              <br />
              Disciples equipped to serve.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
              {churchContent.mission}
            </p>
          </div>
          <div className="min-w-0">
            <h3 className="public-display text-3xl leading-tight sm:text-4xl">
              A home for those seeking God.
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
              {churchContent.vision}
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-7 text-[var(--public-muted)]">
          {churchContent.purposeReferences.join(" · ")}
        </p>
        <div className="mt-8 border-t border-[#d9d0c3] pt-8">
          <h3 className="public-display text-3xl">
            Putting our mission into practice.
          </h3>
          <ol className="mt-7 grid gap-x-8 gap-y-7 md:grid-cols-2">
            {missionObjectives.map((objective, index) => (
              <li key={objective.title} className="flex min-w-0 gap-4">
                <span
                  aria-hidden="true"
                  className="public-display text-3xl text-[var(--public-accent)]"
                >
                  {index + 1}.
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-semibold">{objective.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-[var(--public-muted)]">
                    {objective.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ChurchHistory() {
  return (
    <section
      id="our-story"
      tabIndex={-1}
      className="public-container public-section scroll-mt-32"
    >
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="min-w-0 max-w-lg">
          <p className="public-eyebrow">Our story</p>
          <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
            From a home gathering to a shared life in Christ.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
            {churchContent.localContext}
          </p>
          <p className="mt-5 text-sm leading-7 text-[var(--public-muted)]">
            The wider history of the churches of Christ in Malawi traces
            preaching to 1906. The Red Cross congregation’s own story begins
            later, with the gathering in Zingwangwa in 1962.
          </p>
        </div>
        <ol
          aria-label="Red Cross congregation history"
          className="min-w-0 border-l border-[var(--public-line)] pl-6 sm:pl-8"
        >
          {churchHistory.map((item) => (
            <li key={item.date} className="relative pb-9 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-2 -left-[1.9rem] size-3 rounded-full border-2 border-[var(--brand-surface)] bg-[var(--public-accent)] sm:-left-[2.4rem]"
              />
              <p className="text-sm font-semibold text-[var(--public-accent)]">
                {item.date}
              </p>
              <h3 className="public-display mt-2 text-2xl leading-tight">
                {item.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--public-muted)]">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-9 border-t border-[var(--public-line)] pt-5 text-xs leading-6 text-[var(--public-muted)]">
        Historical source:{" "}
        <cite>Mbiri ya Mpingo wa Khristu mu Malawi mwachidule, 1906–2006</cite>,
        pages 3 and 29–32. These milestones describe the period covered by that
        account.
      </p>
    </section>
  );
}

export function ChurchBeliefs() {
  return (
    <section
      id="our-beliefs"
      tabIndex={-1}
      className="public-container public-section grid scroll-mt-32 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10"
    >
      <div className="min-w-0 max-w-lg">
        <p className="public-eyebrow">Our faith and practice</p>
        <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
          The Bible guides what we believe and how we live.
        </h2>
        <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
          We seek to speak where the Bible speaks and remain silent where it is
          silent. These summaries introduce our teaching; Scripture itself is
          our authority.
        </p>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          You are welcome to ask questions and study the Bible with us.
        </p>
        <div className="mt-5 flex flex-wrap gap-4">
          <Link href="/content" className="public-text-link">
            Explore our messages <FiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/contact" className="public-text-link">
            Talk with the church <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="min-w-0 border-t border-[var(--public-line)]">
        {faithAndPractice.map((belief) => (
          <details
            key={belief.id}
            id={`belief-${belief.id}`}
            className="group scroll-mt-32 border-b border-[var(--public-line)]"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold">
              <span className="min-w-0">{belief.title}</span>
              <FiChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 group-open:rotate-180 motion-reduce:transform-none"
              />
            </summary>
            <div className="pb-6">
              <p className="max-w-2xl text-sm leading-7 text-[var(--public-muted)]">
                {belief.text}
              </p>
              {belief.references.length > 0 && (
                <p className="mt-4 text-xs leading-6 text-[var(--public-muted)]">
                  Scripture: {belief.references.join("; ")}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function WorshipPractices() {
  return (
    <section
      id="our-worship"
      tabIndex={-1}
      className="scroll-mt-32 border-y border-[var(--public-line)] bg-white"
    >
      <div className="public-container public-section">
        <div className="max-w-2xl">
          <p className="public-eyebrow">What to expect in worship</p>
          <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
            Gathered to remember Christ and honour God.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
            Our worship is simple and guided by the New Testament. These are the
            practices you will find when we gather on the first day of the week.
          </p>
        </div>
        <dl className="mt-8 grid gap-x-8 gap-y-8 md:grid-cols-2">
          {worshipPractices.map((practice) => (
            <div
              key={practice.title}
              className="min-w-0 border-t border-[var(--public-line)] pt-5"
            >
              <dt className="public-display text-2xl leading-tight">
                {practice.title}
              </dt>
              <dd className="mt-3 max-w-2xl text-sm leading-7 text-[var(--public-muted)]">
                {practice.text}
                <span className="mt-3 block text-xs leading-6">
                  {practice.references.join("; ")}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
