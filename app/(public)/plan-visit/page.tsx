import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import welcomePhoto from "@/public/images/welcome.webp";
import { ServiceTimes } from "@/components/public/ServiceTimes";
import { VisitForm } from "@/components/public/VisitForm";
import { church, homecellGathering } from "@/config/church";
import { getChurchDateInputValue } from "@/lib/utils/church-date";
import { WorshipPractices } from "@/components/public/ChurchStory";

export const metadata: Metadata = {
  alternates: { canonical: "/plan-visit" },
  title: "Plan your visit",
  description:
    "Join Church of Christ at Red Cross on Mahatma Road in Blantyre. Find Sunday service times, directions, and information for your first visit.",
};

export default function PlanVisitPage() {
  return (
    <>
      <section className="public-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <p className="public-eyebrow">Your first Sunday</p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            Come as you are.
            <br />
            You are welcome here.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            A new place can feel unfamiliar. Here is what you need to find us,
            choose a service, and feel a little more at home before you arrive.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#service-times"
              className="public-button public-button-primary"
            >
              Sunday times <FiArrowRight aria-hidden="true" />
            </a>
            <a
              href={church.mapsUrl}
              className="public-button public-button-secondary"
            >
              Get directions <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--public-muted)]">
            There is no need to register. You can simply come along.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#e7e0d5]">
          <Image
            src={welcomePhoto}
            alt="Members and families arriving outside the church building at Red Cross"
            fill
            preload
            placeholder="blur"
            sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section
        id="service-times"
        className="scroll-mt-36 border-y border-[var(--public-line)] bg-white"
      >
        <div className="public-container public-section grid gap-10 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr] lg:gap-16">
          <div>
            <p className="public-eyebrow">Make yourself at home</p>
            <h2 className="public-display mt-4 text-4xl leading-tight">
              See you
              <br className="hidden lg:block" /> on Sunday.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--public-muted)]">
              Choose our English or Chichewa service. On the last Sunday of the
              month, the whole church gathers for a combined service.
            </p>
          </div>
          <div>
            <h3 className="mb-5 text-base font-semibold">Sunday worship</h3>
            <ServiceTimes />
          </div>
          <div className="rounded-2xl bg-[#f3eee5] p-6 md:col-span-2 lg:col-span-1">
            <FiMapPin
              aria-hidden="true"
              className="size-6 text-[var(--public-accent)]"
            />
            <h3 className="mt-4 text-base font-semibold">
              Find us in Blantyre
            </h3>
            <address className="mt-3 text-sm not-italic leading-7 text-[var(--public-muted)]">
              {church.name}
              <br />
              {church.address}
            </address>
            <a href={church.mapsUrl} className="public-text-link mt-3">
              Open map &amp; directions <FiArrowUpRight aria-hidden="true" />
            </a>
            <p className="mt-3 text-xs leading-6 text-[var(--public-muted)]">
              Need a hand finding us?{" "}
              <a
                href={church.phoneUrl}
                className="font-semibold underline underline-offset-4"
              >
                Call {church.phone}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="public-container public-section">
        <div className="max-w-2xl">
          <p className="public-eyebrow">A little about us</p>
          <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
            A shared faith.
            <br />A warm welcome.
          </h2>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="border-t border-[var(--public-line)] pt-6">
            <h3 className="text-lg font-semibold">Worship together</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
              We sing together without musical instruments, pray, learn from
              Scripture, share the Lord&apos;s Supper each Sunday, and give from
              the blessings God has entrusted to us.
            </p>
            <Link href="/about" className="public-text-link mt-3">
              Our faith &amp; church story <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="border-t border-[var(--public-line)] pt-6">
            <h3 className="text-lg font-semibold">
              Keep the conversation going
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
              Homecells are smaller groups that share life and encouragement.
              They meet on {homecellGathering.day}s at {homecellGathering.time},
              according to each group&apos;s program.
            </p>
            <Link href="/homecells" className="public-text-link mt-3">
              Explore homecells <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="border-t border-[var(--public-line)] pt-6">
            <h3 className="text-lg font-semibold">Ask us anything</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
              Have a question about bringing children, getting here, or
              accessibility? Please contact us so we can help you plan.
            </p>
            <Link href="/contact" className="public-text-link mt-3">
              Contact the church <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <WorshipPractices />

      <section id="let-us-know" className="scroll-mt-36 bg-[#f0eadf]">
        <div className="public-container public-section grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="max-w-lg">
            <p className="public-eyebrow">An optional hello</p>
            <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
              Let us know
              <br />
              you are coming.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
              If you would like to introduce yourself before you arrive, send us
              a few details. You are just as welcome to come without filling
              this in.
            </p>
            <div className="mt-7 border-t border-[#d9d0c3] pt-6">
              <p className="text-sm font-semibold">Prefer a conversation?</p>
              <a href={church.whatsappUrl} className="public-text-link mt-2">
                <FiMessageCircle aria-hidden="true" /> Chat with us on WhatsApp{" "}
                <FiArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="min-w-0">
            <VisitForm earliestVisitDate={getChurchDateInputValue()} />
          </div>
        </div>
      </section>

      <section className="public-container public-section">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <h2 className="public-display text-3xl leading-tight sm:text-4xl">
            Before you come.
          </h2>
          <div className="divide-y divide-[var(--public-line)] border-y border-[var(--public-line)]">
            {[
              [
                "Do I need to register?",
                "No. The visit form is optional. You are welcome to attend a service without sending us your details first.",
              ],
              [
                "Which language should I choose?",
                "You are welcome at either the English or Chichewa service. Check the Sunday times above, including the combined service on the last Sunday of the month.",
              ],
              [
                "What if I have a specific question?",
                "Please contact the church about children, accessibility, travel, or anything else you would like to discuss before visiting.",
              ],
            ].map(([question, answer]) => (
              <details key={question} className="group py-1">
                <summary className="cursor-pointer py-5 pr-5 text-sm font-semibold sm:text-base">
                  {question}
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-7 text-[var(--public-muted)]">
                  {answer}
                </p>
              </details>
            ))}
            <Link href="/contact" className="public-text-link py-5">
              Talk to us before your visit <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
