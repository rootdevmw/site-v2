export type Event = {
  id: string;
  title: string;
  startTime: string;
  location?: string | null;
};

export type Ministry = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  purpose: string;
  leaderId?: string;
  overseerId?: string | null;

  leader?: {
    id: string;
    firstName: string;
    lastName: string;
    prefix: string;
    bio?: { bio: string } | null;
  };

  overseer?: {
    id: string;
    firstName: string;
    lastName: string;
    prefix: string;
    bio?: { bio: string } | null;
  };

  members?: {
    id: string;
    firstName: string;
    lastName: string;
    prefix: string;
    bio?: { bio: string } | null;
  }[];

  //  NEW
  events?: Event[];
};

export type MinistryFilters = {
  page?: number;
  limit?: number;
  search?: string;
  leaderId?: string;
  overseerId?: string;
};

export type MinistryMember = {
  id: string;
  firstName: string;
  lastName: string;
  status?: string;
};

export type MinistryMemberRow = {
  member?: MinistryMember;
} & Partial<MinistryMember>;

export type MinistryMemberPayload =
  | MinistryMemberRow[]
  | {
      members?: MinistryMember[];
    }
  | undefined;
