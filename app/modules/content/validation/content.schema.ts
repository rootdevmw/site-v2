import { z } from "zod";

export const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  typeId: z.string().min(1, "Content type is required"),
  authorId: z.string().min(1, "Author is required"),
  tags: z.array(z.string().min(1, "Each tag must have a value")).default([]),
  scriptures: z
    .array(
      z.object({
        book: z.string().min(1, "Book is required"),
        chapter: z.preprocess(
          (value) => {
            if (typeof value === "string") {
              const parsed = Number(value);
              return Number.isNaN(parsed) ? undefined : parsed;
            }

            if (typeof value === "number") {
              return Number.isNaN(value) ? undefined : value;
            }

            return undefined;
          },
          z.number().min(1, "Chapter is required"),
        ),
        verseFrom: z.preprocess(
          (value) => {
            if (typeof value === "string") {
              const parsed = Number(value);
              return Number.isNaN(parsed) ? undefined : parsed;
            }

            if (typeof value === "number") {
              return Number.isNaN(value) ? undefined : value;
            }

            return undefined;
          },
          z.number().min(1, "Verse from is required"),
        ),
        verseTo: z.preprocess((value) => {
          if (typeof value === "string") {
            const parsed = Number(value);
            return Number.isNaN(parsed) ? undefined : parsed;
          }

          if (typeof value === "number") {
            return Number.isNaN(value) ? undefined : value;
          }

          return undefined;
        }, z.number().optional()),
      }),
    )
    .default([]),
});

export type ContentFormValues = z.infer<typeof contentSchema>;
