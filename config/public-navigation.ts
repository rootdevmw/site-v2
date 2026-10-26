export const aboutSections = [
  { label: "Mission & vision", href: "/about#our-purpose" },
  { label: "Our story", href: "/about#our-story" },
  { label: "Faith & practice", href: "/about#our-beliefs" },
  { label: "Our worship", href: "/about#our-worship" },
  { label: "Church leadership", href: "/about#church-leadership" },
  { label: "Our pastors", href: "/about#our-pastors" },
] as const;

type PublicNavigationItem = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
};

export const publicNavigation: readonly PublicNavigationItem[] = [
  {
    label: "About us",
    href: "/about",
    children: [{ label: "Our church", href: "/about" }, ...aboutSections],
  },
  {
    label: "Visit",
    href: "/plan-visit",
    children: [
      { label: "Plan your visit", href: "/plan-visit" },
      { label: "Contact & directions", href: "/contact" },
    ],
  },
  {
    label: "Connect",
    href: "/ministries",
    children: [
      { label: "Ministries", href: "/ministries" },
      { label: "Homecells · small groups", href: "/homecells" },
      { label: "Request prayer", href: "/prayer-request" },
    ],
  },
  {
    label: "Messages",
    href: "/content",
    children: [
      { label: "Messages & articles", href: "/content" },
      { label: "Broadcast library", href: "/broadcasts" },
      { label: "Publications", href: "/publications" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Upcoming gatherings", href: "/events" },
      { label: "Service programs", href: "/programs" },
    ],
  },
] as const;
