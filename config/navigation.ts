export const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["VISITOR"],
  },
  {
    label: "Members",
    href: "/dashboard/members",
    roles: ["DEACON"],
  },
  {
    label: "Ministries",
    href: "/dashboard/ministries",
    roles: ["DEACON"],
  },
  {
    label: "Homecells",
    href: "/dashboard/homecells",
    roles: ["DEACON"],
  },
  {
    label: "Content",
    href: "/dashboard/content",
    roles: ["MEDIA"],
  },
  {
    label: "Events",
    href: "/dashboard/events",
    roles: ["DEACON"],
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    roles: ["DEACON"],
  },

  // PROGRAMS
  {
    label: "Programs",
    roles: ["DEACON"],
    children: [
      {
        label: "Programs",
        href: "/dashboard/programs",
        roles: ["DEACON"],
      },
      {
        label: "Templates",
        href: "/dashboard/program-templates",
        roles: ["DEACON"],
      },
      {
        label: "Types",
        href: "/dashboard/program-types",
        roles: ["DEACON"],
      },
    ],
  },

  {
    label: "Streams",
    href: "/dashboard/streams",
    roles: ["MEDIA"],
  },
  {
    label: "Publications",
    href: "/dashboard/publications",
    roles: ["MEDIA"],
  },

  // AUTH
  {
    label: "Auth",
    roles: ["ADMIN"],
    children: [
      {
        label: "users",
        href: "/dashboard/users",
        roles: ["ADMIN"],
      },
      {
        label: "roles",
        href: "/dashboard/roles",
        roles: ["ROOT"],
      },
    ],
  },

  {
    label: "Settings",
    roles: ["VISITOR"],
    children: [
      {
        label: "Change Password",
        href: "/dashboard/settings/change-password",
        roles: ["VISITOR"],
      },
    ],
  },
  {
    label: "Audit",
    href: "/dashboard/audit",
    roles: ["ADMIN"],
  },
  {
    label: "Attention",
    roles: ["DEACON"],
    children: [
      {
        label: "Prayer Requests",
        href: "/dashboard/attention/prayers",
        roles: ["DEACON"],
      },
      {
        label: "Visitors",
        href: "/dashboard/attention/visitors",
        roles: ["DEACON"],
      },
      {
        label: "Manage",
        href: "/dashboard/attention/manage",
        roles: ["DEACON"],
      },
    ],
  },
];
