export const navigation = [
  {
    label: "Dashboard",
    href: "/",
    roles: ["ADMIN", "PASTOR", "DEACON", "EDITOR", "MEDIA"],
  },
  {
    label: "Members",
    href: "/members",
    roles: ["ADMIN", "PASTOR", "DEACON"],
  },
  {
    label: "Ministries",
    href: "/ministries",
    roles: ["ADMIN", "PASTOR", "DEACON"],
  },
  {
    label: "Homecells",
    href: "/homecells",
    roles: ["ADMIN", "PASTOR", "DEACON"],
  },
  {
    label: "Content",
    href: "/content",
    roles: ["ADMIN", "EDITOR", "DEACON"],
  },
  {
    label: "Events",
    href: "/events",
    roles: ["ADMIN", "EDITOR", "DEACON"],
  },
  {
    label: "Announcements",
    href: "/announcements",
    roles: ["ADMIN", "EDITOR", "DEACON"],
  },

  //  GROUPED PROGRAMS
  {
    label: "Programs",
    roles: ["ADMIN", "PASTOR", "DEACON"],
    children: [
      {
        label: "Programs",
        href: "/programs",
        roles: ["ADMIN", "PASTOR", "DEACON"],
      },
      {
        label: "Templates",
        href: "/program-templates",
        roles: ["ADMIN", "PASTOR", "DEACON"],
      },
      { label: "Types", href: "/program-types", roles: ["ADMIN", "PASTOR"] },
    ],
  },

  {
    label: "Streams",
    href: "/streams",
    roles: ["ADMIN", "MEDIA", "DEACON"],
  },
  {
    label: "Newsletters",
    href: "/newsletters",
    roles: ["ADMIN", "EDITOR", "MEDIA", "DEACON"],
  },
];
