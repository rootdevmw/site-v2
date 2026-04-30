export type EventType = {
  id: string;
  name: string;
};

export type Ministry = {
  id: string;
  name: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  typeId: string;
  type?: EventType | null;
  ministries?: Ministry[];
  startTime: string;
  endTime: string;
  createdAt?: string;
};

export type EventFilters = {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  typeId?: string;
};

export type EventFormValues = {
  title: string;
  description?: string;
  location?: string;
  typeId: string;
  ministryIds: string[];
  startTime: string;
  endTime: string;
};
