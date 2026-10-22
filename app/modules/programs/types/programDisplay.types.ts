export type ProgramDisplayItem = {
  id?: string | number;
  title: string;
  description?: string | null;
  time?: string | null;
  sequence: number;
  responsibleId?: string | null;
  responsible?: {
    id?: string;
    prefix?: string | null;
    firstName: string;
    lastName: string;
  } | null;
};

export type ProgramDisplay = {
  items: ProgramDisplayItem[];
};
