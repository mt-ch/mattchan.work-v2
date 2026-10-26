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
    <section className="gap-sm bg-surface p-sm flex flex-col rounded-md">
      <h2 className="type-small text-foreground">{title}</h2>
      <dl className="text-small gap-2xs grid grid-cols-[auto_1fr]">
        {year ? (
          <>
            <dt className="text-muted pr-sm">Year</dt>
            <dd className="text-foreground">{year}</dd>
          </>
        ) : null}
        {discipline.length > 0 ? (
          <>
            <dt className="text-muted pr-sm">Discipline</dt>
            <dd className="text-foreground">{discipline.join(" + ")}</dd>
          </>
        ) : null}
      </dl>
      <p className="text-small text-foreground">{summary}</p>
    </section>
  );
}
