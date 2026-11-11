// Transcribed from the supplied SAIL 2027 registration flyer (v7).
// The flyer names Malawi but does not specify a venue or programme.
export const sail2027 = {
  name: "Southern Africa International Lectureship",
  host: "Church of Christ · Malawi",
  dates: "26–28 March 2027",
  startDate: "2027-03-26",
  endDate: "2027-03-28",
  deadline: "31 December 2026",
  deadlineDate: "2026-12-31",
  registrationUrl:
    "https://script.google.com/macros/s/AKfycbzunhpPLTb0eeS9SEbKinFOhgF8V_oE_48ueH0qzq-yo2glc_h2eyKAltvOZDGIyp_u/exec",
  logo: "/sail-2027/logo.jpeg",
  flyer: "/sail-2027/registration-flyer.pdf",
  fees: [
    {
      label: "Local delegates",
      currency: "MK",
      amount: "60,000",
      price: 60000,
      priceCurrency: "MWK",
    },
    {
      label: "International delegates",
      currency: "ZAR",
      amount: "1,000",
      price: 1000,
      priceCurrency: "ZAR",
    },
  ],
  bank: {
    name: "National Bank",
    branch: "Chichiri Branch",
    accountName: "Church of Christ",
    accountNumber: "667118",
    swiftCode: "NBMAMWMW",
  },
  mobileMoney: [
    { name: "Mpamba", number: "440282" },
    { name: "Airtel Money", number: "427549" },
  ],
  mobileMoneyName: "Ausbert Khembo",
  paymentContact: {
    name: "Bro Khembo",
    phone: "0888 862 744",
    href: "tel:+265888862744",
  },
  enquiries: [
    { phone: "0999 632 002", href: "tel:+265999632002" },
    { phone: "0888 207 552", href: "tel:+265888207552" },
    { phone: "0884 285 834", href: "tel:+265884285834" },
  ],
} as const;
