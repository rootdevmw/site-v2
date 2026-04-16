export type Homecell = {
  id: string;
  name: string;
  location: string;
  leader?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  overseer?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type HomecellFormValues = {
  name: string;
  location: string;
  leaderId?: string;
  overseerId?: string;
};
