import type { ProgramItem } from "@/app/modules/programs/types/program.types";

export type ProgramTemplateItem = ProgramItem;

export type ProgramTemplate = {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
  };
  homecellId?: string | null;
  homecell?: { id: string; name: string; location?: string | null } | null;
  createdAt?: string | null;
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
