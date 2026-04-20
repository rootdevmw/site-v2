export type AnnouncementTarget = {
  targetType: "MINISTRY" | "HOMECELL" | "ROLE";
  targetId: string;
};

export type Announcement = {
  id: string;
  title: string;
  description?: string | null;
  body: string;
  priority: number;
  publishedAt?: string | null;
  expiryDate?: string | null;
  targets: AnnouncementTarget[];
  createdAt: string;
};

export type AnnouncementFormValues = {
  title: string;
  body: string;
  priority: number;
  expiryDate?: string | null;
  targets: AnnouncementTarget[];
};

export type AnnouncementFilters = {
  page?: number;
  limit?: number;
  search?: string;
};
