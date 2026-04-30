import { Program } from "../../programs/types/program.types";

export type Homecell = {
  id: string;
  name: string;
  location: string;
  slug: string;
  leader?: {
    id: string;
    firstName: string;
    lastName: string;
    prefix?: string;
    bio?: {
      bio: string;
      id: string;
    };
  } | null;
  overseer?: {
    id: string;
    firstName: string;
    lastName: string;
    prefix?: string;
    bio?: {
      bio: string;
      id: string;
    };
  } | null;
  programs?: Program[];
};

export type HomecellFormValues = {
  name: string;
  location: string;
  leaderId?: string;
  overseerId?: string;
};
