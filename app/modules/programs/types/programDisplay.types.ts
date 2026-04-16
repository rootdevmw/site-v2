export type ProgramDisplayItem = {
  id?: string | number;
  title: string;
  description?: string;
  time?: string;
  sequence: number;
  responsible?: {
    firstName: string;
    lastName: string;
  };
};

export type ProgramDisplay = {
  items: ProgramDisplayItem[];
};
