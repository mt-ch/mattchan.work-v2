/**
 * A Project's title, year, disciplines and summary.
 *
 * @param props.title - The Project's title.
 * @param props.year - Year completed; omitted from the output when unset.
 * @param props.discipline - The Project's disciplines.
 * @param props.summary - A short description of the Project.
 * @returns The details block.
 */
export function ProjectMeta({
  title,
  year,
  discipline,
  summary,
}: {
  title: string;
  year?: number;
  discipline: string[];
  summary: string;
}) {
  return (
    <section className="flex flex-col gap-sm">
      <div className="flex flex-col gap-2xs">
        <h2 className="text-small text-foreground">{title}</h2>
        {year ? <p className="text-small text-muted">{year}</p> : null}
        {discipline.length > 0 ? (
          <p className="text-small text-muted">{discipline.join(" + ")}</p>
        ) : null}
      </div>
      <p className="text-small font-light text-foreground">{summary}</p>
    </section>
  );
}
