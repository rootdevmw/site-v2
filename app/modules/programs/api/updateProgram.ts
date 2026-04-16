import { api } from "@/lib/api/client";

type ProgramItemInput = {
  title: string;
  description?: string;
  time?: string;
  sequence: number;
  responsibleId?: string;
};

type UpdateProgramInput = {
  id: string;
  data: {
    date?: string;
    typeId?: string;
    homecellId?: string;
    items?: ProgramItemInput[];
  };
};

export const updateProgram = async ({ id, data }: UpdateProgramInput) => {
  const res = await api.patch(`/programs/${id}`, data);
  return res.data;
};
