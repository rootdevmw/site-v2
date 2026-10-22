export const publicNavigation = [
  { label: "About", href: "/about" },
  { label: "Visit", href: "/plan-visit", children: [
    { label: "Plan your visit", href: "/plan-visit" },
    { label: "Contact & directions", href: "/contact" },
  ] },
  { label: "Connect", href: "/ministries", children: [
    { label: "Ministries", href: "/ministries" },
    { label: "Homecells · small groups", href: "/homecells" },
    { label: "Request prayer", href: "/prayer-request" },
  ] },
  { label: "Messages", href: "/content", children: [
    { label: "Messages & articles", href: "/content" },
    { label: "Publications", href: "/publications" },
  ] },
  { label: "Events", href: "/events", children: [
    { label: "Upcoming gatherings", href: "/events" },
    { label: "Service programs", href: "/programs" },
  ] },
] as const;
