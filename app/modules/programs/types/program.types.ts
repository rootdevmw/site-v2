export type ProgramItem = {
  id?: string;
  title: string;
  description?: string;
  time?: string;
  sequence: number;
  responsible?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  responsibleId?: string;
};

export type ProgramType = {
  id: string;
  name: string;
};

export type Program = {
  id: string;
  date: string;
  type: {
    id: string;
    name: string;
  };
  homecellId?: string;
  items: ProgramItem[];
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
