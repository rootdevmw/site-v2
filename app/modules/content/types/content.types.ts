import { Member } from "@/app/modules/members/types/member.types";

export type ContentType = {
  id: string;
  name: string;
};

export type ContentTag = {
  id: string;
  tag: {
    id: string;
    name: string;
  };
};

export type Scripture = {
  id?: string;
  book: string;
  chapter: number;
  verseFrom: number;
  verseTo?: number | null;
  version?: string | null;
};

export type Content = {
  id: string;
  title: string;
  body: string;
  slug:string;
  status: "Draft" | "Published";
  type: ContentType;
  typeId?: string;
  authorId?: string | null;
  author: Member | null;
  tags: ContentTag[];
  scriptures: Scripture[];
  createdAt: string;
};

export type ContentFormValues = {
  title: string;
  body: string;
  typeId: string;
  authorId: string;
  tags: string[];
  scriptures: Scripture[];
};
