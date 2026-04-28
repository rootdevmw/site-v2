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
  book: string;
  chapter: number;
  verseFrom: number;
  verseTo?: number;
};

export type Content = {
  id: string;
  title: string;
  body: string;
  slug:string;
  status: "Draft" | "Published";
  type: ContentType;
  author: Member;
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
