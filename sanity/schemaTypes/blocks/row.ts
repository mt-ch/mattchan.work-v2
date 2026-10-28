// Third-party libraries
import { defineField, defineType } from "sanity";

export const row = defineType({
  name: "row",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      options: {
        list: [
          { title: "One cell", value: 1 },
          { title: "Two cells", value: 2 },
        ],
        layout: "radio",
      },
      initialValue: 1,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "items",
      title: "Cells",
      description: "Must contain exactly as many cells as columns.",
      type: "array",
      of: [{ type: "imageCell" }, { type: "videoCell" }, { type: "textCell" }],
      validation: (rule) =>
        rule.required().custom((items, context) => {
          const parent = context.parent as { columns?: number } | undefined;
          const columns = parent?.columns;
          if (columns && items?.length !== columns) {
            return `A ${columns}-column row needs exactly ${columns} cell${
              columns === 1 ? "" : "s"
            }.`;
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { columns: "columns", items: "items" },
    prepare({ columns, items }) {
      const types = (items ?? []).map(
        (item: { _type?: string }) => item._type?.replace("Cell", "") ?? "",
      );
      return {
        title: `Row (${columns ?? "?"} col)`,
        subtitle: types.join(" + "),
      };
    },
  },
});
