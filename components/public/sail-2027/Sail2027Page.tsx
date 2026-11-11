import Image from "next/image";
import type { ReactNode } from "react";
import {
  FiArrowDown,
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiMapPin,
  FiPhone,
  FiSmartphone,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { sail2027 as sail } from "@/config/sail-2027";
import { ShareButton } from "@/components/public/ShareButton";
import { SailCopyButton } from "./SailCopyButton";
import styles from "./sail-2027.module.css";

function RegisterLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={sail.registrationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <FiArrowUpRight aria-hidden="true" />
      <span className="sr-only"> (opens registration in a new tab)</span>
    </a>
  );
}

function Mountains() {
  return (
    <svg
      className={styles.mountains}
      viewBox="0 0 1200 210"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 205 122 114 188 159 341 41 490 177 590 104 703 199 857 63 1024 181 1138 109 1200 173V210H0Z"
        fill="currentColor"
        opacity=".14"
      />
      <path
        d="M0 210 185 169 340 84 499 210 704 210 857 102 1004 210 1138 149 1200 202V210Z"
        fill="currentColor"
        opacity=".2"
      />
    </svg>
  );
}

export function Sail2027Page() {
  return (
    <div className={styles.page}>
      <div className="public-container">
        <nav aria-label="SAIL 2027 page sections" className={styles.navigation}>
          <span className={styles.eventLabel}>
            <span aria-hidden="true" />
            SAIL 2027 <span className={styles.eventCountry}>Malawi</span>
          </span>
          <div className={styles.sectionLinks}>
            <a href="#sail-registration">Register</a>
            <a href="#sail-payments">Payment details</a>
            <a href="#sail-enquiries">Enquiries</a>
            <a
              href={sail.flyer}
              download="SAIL-2027-registration-flyer.pdf"
              className={styles.flyerLink}
            >
              <FiDownload aria-hidden="true" />
              Flyer
            </a>
          </div>
        </nav>
      </div>

      <section className={styles.hero} aria-labelledby="sail-heading">
        <div className={`public-container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              Southern Africa International Lectureship
            </p>
            <h1 id="sail-heading" className={styles.title}>
              SAIL <span>2027.</span>
            </h1>
            <p className={styles.heroStatement}>
              Faith brings us together.
              <br />
              Let’s gather in Malawi.
            </p>
            <p className={styles.introduction}>
              Join the Church of Christ family for the Southern Africa
              International Lectureship, <strong>{sail.dates}</strong>. Register
              as an individual or bring your group.
            </p>
            <div className={styles.heroActions}>
              <RegisterLink
                className={`${styles.button} ${styles.buttonYellow}`}
              >
                Register for SAIL 2027
              </RegisterLink>
              <a href="#sail-payments" className={styles.textLink}>
                How to pay
                <FiArrowDown aria-hidden="true" />
              </a>
            </div>
            <p className={styles.deadline}>
              <FiClock aria-hidden="true" />
              Register by{" "}
              <time dateTime={sail.deadlineDate}>{sail.deadline}</time>
            </p>
          </div>
          <div className={styles.logoComposition}>
            <div className={styles.dateFlag}>
              <FiCalendar aria-hidden="true" />
              <span>
                {sail.dates}
                <small>Malawi · Church of Christ</small>
              </span>
            </div>
            <div className={styles.logoCard}>
              <div className={styles.logoViewport}>
                <Image
                  src={sail.logo}
                  alt="SAIL 2027 — Southern Africa International Lectureship, Church of Christ Malawi"
                  width={1200}
                  height={1200}
                  sizes="(min-width: 1024px) 42vw, (min-width: 640px) 75vw, 92vw"
                  preload
                  className={styles.logo}
                />
              </div>
              <div className={styles.logoCaption}>
                <span>One gathering. A shared faith.</span>
                <span className={styles.logoTag}>
                  Malawi 2027
                  <FiArrowUpRight aria-hidden="true" />
                </span>
              </div>
            </div>
            <p className={styles.campaign}>#BePartOfThe2000+</p>
          </div>
        </div>
        <Mountains />
      </section>

      <div className={styles.factsBand}>
        <dl className={`public-container ${styles.facts}`}>
          <div>
            <dt>
              <FiCalendar aria-hidden="true" />
              Event dates
            </dt>
            <dd>
              <time dateTime={sail.startDate}>{sail.dates}</time>
            </dd>
          </div>
          <div>
            <dt>
              <FiMapPin aria-hidden="true" />
              Host country
            </dt>
            <dd>
              Malawi<small>{sail.host}</small>
            </dd>
          </div>
          <div>
            <dt>
              <FiClock aria-hidden="true" />
              Registration closes
            </dt>
            <dd>
              <time dateTime={sail.deadlineDate}>{sail.deadline}</time>
            </dd>
          </div>
        </dl>
      </div>

      <section
        id="sail-registration"
        className={`public-container ${styles.section}`}
        aria-labelledby="sail-register-heading"
      >
        <div className={styles.registrationIntro}>
          <div>
            <p className={styles.eyebrow}>01 / Your place at SAIL</p>
            <h2 id="sail-register-heading" className={styles.sectionHeading}>
              Come on your own.
              <br />
              <span>Come together.</span>
            </h2>
            <p className={styles.sectionCopy}>
              However you’re coming, start with registration. Choose the
              individual or group option in the registration form, then arrange
              your payment.
            </p>
          </div>
          <dl className={styles.fees}>
            {sail.fees.map((fee) => (
              <div key={fee.label}>
                <dt>{fee.label}</dt>
                <dd>
                  <span>{fee.currency}</span> {fee.amount}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={styles.registrationOptions}>
          <article className={styles.individualCard}>
            <FiUser aria-hidden="true" className={styles.optionIcon} />
            <div>
              <h3>As an individual</h3>
              <p>Make your own plans to join the gathering.</p>
            </div>
            <RegisterLink className={styles.optionLink}>
              Register individually
            </RegisterLink>
          </article>
          <article className={styles.groupCard}>
            <FiUsers aria-hidden="true" className={styles.optionIcon} />
            <div>
              <h3>As a group</h3>
              <p>Bring your church family and register together.</p>
            </div>
            <RegisterLink className={styles.optionLink}>
              Register your group
            </RegisterLink>
          </article>
        </div>
        <p className={styles.registrationNote}>
          <FiCheck aria-hidden="true" />
          Complete your registration by <strong>{sail.deadline}</strong>. Both
          options open the SAIL registration form.
        </p>
      </section>

      <section
        id="sail-payments"
        className={styles.paymentSection}
        aria-labelledby="sail-payments-heading"
      >
        <div className={`public-container ${styles.section}`}>
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>02 / Make it official</p>
              <h2 id="sail-payments-heading" className={styles.sectionHeading}>
                Your next step:
                <br />
                <span>registration payment.</span>
              </h2>
            </div>
            <p className={styles.sectionCopy}>
              After registering, pay by bank transfer or mobile money using the
              details below. Local delegates pay MK 60,000; international
              delegates pay ZAR 1,000.
            </p>
          </div>
          <div className={styles.paymentGrid}>
            <section
              className={styles.bankCard}
              aria-labelledby="sail-bank-heading"
            >
              <div className={styles.paymentCardHeader}>
                <FiCreditCard aria-hidden="true" />
                <span>Bank transfer</span>
              </div>
              <h3 id="sail-bank-heading">{sail.bank.name}</h3>
              <p className={styles.branch}>{sail.bank.branch}</p>
              <dl className={styles.bankDetails}>
                <div>
                  <dt>Account name</dt>
                  <dd>{sail.bank.accountName}</dd>
                </div>
                <div>
                  <dt>Account number</dt>
                  <dd>
                    <span className={styles.paymentValue}>
                      {sail.bank.accountNumber}
                    </span>
                    <SailCopyButton
                      label="bank account number"
                      value={sail.bank.accountNumber}
                    />
                  </dd>
                </div>
                <div>
                  <dt>SWIFT code</dt>
                  <dd>
                    <span className={styles.paymentValue}>
                      {sail.bank.swiftCode}
                    </span>
                    <SailCopyButton
                      label="SWIFT code"
                      value={sail.bank.swiftCode}
                    />
                  </dd>
                </div>
              </dl>
            </section>
            <section
              className={styles.mobileCard}
              aria-labelledby="sail-mobile-heading"
            >
              <div className={styles.paymentCardHeader}>
                <FiSmartphone aria-hidden="true" />
                <span>Mobile money</span>
              </div>
              <h3 id="sail-mobile-heading">Pay from your phone.</h3>
              <p className={styles.branch}>{sail.mobileMoneyName}</p>
              <dl className={styles.mobileDetails}>
                {sail.mobileMoney.map((method) => (
                  <div key={method.name}>
                    <dt>{method.name}</dt>
                    <dd>
                      <span className={styles.paymentValue}>
                        {method.number}
                      </span>
                      <SailCopyButton
                        label={`${method.name} number`}
                        value={method.number}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className={styles.mobileFootnote}>
                Use the payment numbers shown here, as listed on the
                registration flyer.
              </p>
            </section>
          </div>
          <div className={styles.paymentNotice}>
            <span className={styles.noticeIcon}>
              <FiCheck aria-hidden="true" />
            </span>
            <div>
              <h3>Paid? Let Bro Khembo know.</h3>
              <p>
                After sending your payment, please notify{" "}
                {sail.paymentContact.name}.
              </p>
              <p className={styles.chichewa} lang="ny">
                Mukatumiza ndalama chonde adziwitseni Bro Khembo.
              </p>
            </div>
            <a href={sail.paymentContact.href} className={styles.noticePhone}>
              <FiPhone aria-hidden="true" />
              {sail.paymentContact.phone}
            </a>
          </div>
        </div>
      </section>

      <section
        id="sail-enquiries"
        className={`public-container ${styles.section}`}
        aria-labelledby="sail-enquiries-heading"
      >
        <div className={styles.contactGrid}>
          <div>
            <p className={styles.eyebrow}>03 / We’re here to help</p>
            <h2 id="sail-enquiries-heading" className={styles.sectionHeading}>
              A question before
              <br />
              <span>you register?</span>
            </h2>
            <p className={styles.sectionCopy}>
              Get in touch with the SAIL organising team for registration
              enquiries and help planning your attendance.
            </p>
            <ul className={styles.contactList}>
              {sail.enquiries.map((contact, index) => (
                <li key={contact.phone}>
                  <a href={contact.href}>
                    <span>
                      <FiPhone aria-hidden="true" />
                      <span className="sr-only">
                        Enquiry line {index + 1}:{" "}
                      </span>
                      {contact.phone}
                    </span>
                    <FiArrowUpRight aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <aside className={styles.flyerCard}>
            <div className={styles.flyerIcon}>
              <FiDownload aria-hidden="true" />
            </div>
            <p className={styles.eyebrow}>Keep the details close</p>
            <h3>
              The invitation,
              <br />
              ready to share.
            </h3>
            <p>
              Save the registration flyer for the dates, fees, payment details
              and enquiry numbers in one place.
            </p>
            <a
              href={sail.flyer}
              download="SAIL-2027-registration-flyer.pdf"
              className={`${styles.button} ${styles.buttonInk}`}
            >
              Download the flyer
              <FiDownload aria-hidden="true" />
            </a>
            <span className={styles.fileNote}>
              Original registration flyer · PDF
            </span>
          </aside>
        </div>
      </section>

      <section
        className={styles.closing}
        aria-labelledby="sail-closing-heading"
      >
        <div className={`public-container ${styles.closingInner}`}>
          <div>
            <p className={styles.closingEyebrow}>SAIL 2027 · {sail.dates}</p>
            <h2 id="sail-closing-heading">
              Register. Pay.
              <br />
              <span>Arrive. Gather.</span>
            </h2>
            <p>#BePartOfThe2000+</p>
          </div>
          <div className={styles.closingActions}>
            <RegisterLink className={`${styles.button} ${styles.buttonYellow}`}>
              Register for SAIL 2027
            </RegisterLink>
            <div className={styles.share}>
              <ShareButton
                title="SAIL 2027 — Southern Africa International Lectureship, Malawi"
                path="/sail-2027"
                label="Share the invitation"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
