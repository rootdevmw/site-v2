export type Ministry = {
  id: string;
  name: string;
  description?: string;

  leaderId?: string;
  overseerId?: string | null;

  leader?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  overseer?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  members?: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
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
