export type ProgramItem = {
  id?: string;
  title: string;
  description?: string | null;
  time?: string | null;
  sequence: number;
  responsible?: {
    id: string;
    firstName: string;
    lastName: string;
    prefix?: string | null;
  } | null;
  responsibleId?: string | null;
};

export type ProgramType = {
  id: string;
  name: string;
};

export type Program = {
  id: string;
  date: string;
  slug: string;
  location?: string | null;
  type: {
    id: string;
    name: string;
  };
  homecellId?: string | null;
  homecell?: { id: string; name: string; location?: string | null } | null;
  createdAt?: string | null;
  items: ProgramItem[];
  tags?: { id: string; name: string }[];
  scriptures: [];
};

export type ProgramFormValues = {
  date: string;
  typeId: string;
  homecellId?: string;
  items: {
    title: string;
    description?: string;
    time?: string;
    responsibleId?: string;
  }[];
};
