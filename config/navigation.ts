export const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["ADMIN", "PASTOR", "DEACON", "EDITOR", "MEDIA"],
  },
  {
    label: "Members",
    href: "/dashboard/members",
    roles: ["ADMIN", "PASTOR", "DEACON"],
  },
  {
    label: "Ministries",
    href: "/dashboard/ministries",
    roles: ["ADMIN", "PASTOR", "DEACON"],
  },
  {
    label: "Homecells",
    href: "/dashboard/homecells",
    roles: ["ADMIN", "PASTOR", "DEACON"],
  },
  {
    label: "Content",
    href: "/dashboard/content",
    roles: ["ADMIN", "EDITOR", "DEACON"],
  },
  {
    label: "Events",
    href: "/dashboard/events",
    roles: ["ADMIN", "EDITOR", "DEACON"],
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    roles: ["ADMIN", "EDITOR", "DEACON"],
  },

  //  GROUPED PROGRAMS
  {
    label: "Programs",
    roles: ["ADMIN", "PASTOR", "DEACON"],
    children: [
      {
        label: "Programs",
        href: "/dashboard/programs",
        roles: ["ADMIN", "PASTOR", "DEACON"],
      },
      {
        label: "Templates",
        href: "/dashboard/program-templates",
        roles: ["ADMIN", "PASTOR", "DEACON"],
      },
      {
        label: "Types",
        href: "/dashboard/program-types",
        roles: ["ADMIN", "PASTOR"],
      },
    ],
  },

  {
    label: "Streams",
    href: "/dashboard/streams",
    roles: ["ADMIN", "MEDIA", "DEACON"],
  },
  {
    label: "Newsletters",
    href: "/dashboard/newsletters",
    roles: ["ADMIN", "EDITOR", "MEDIA", "DEACON"],
  },
  {
    label: "Auth",
    roles: ["ADMIN"],
    children: [
      {
        label: "users",
        href: "/dashboard/users",
        roles: ["ADMIN", "PASTOR", "DEACON"],
      },
      { label: "roles", href: "/dashboard/roles", roles: ["ADMIN", "PASTOR"] },
    ],
  },
];
