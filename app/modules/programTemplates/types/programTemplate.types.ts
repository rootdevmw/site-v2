export type ProgramTemplateItem = {
  title: string;
  description?: string;
  time?: string;
  sequence: number;
  responsibleId?: string;
};

export type ProgramTemplate = {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
  };
  homecellId?: string;
  items: ProgramTemplateItem[];
};

export type ProgramTemplateFormValues = {
  name: string;
  typeId: string;
  homecellId?: string;
  items: {
    title: string;
    description?: string;
    time?: string;
    responsibleId?: string;
  }[];
};
