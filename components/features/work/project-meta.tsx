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
    <section className="gap-sm flex flex-col">
      <div className="gap-2xs flex flex-col">
        <h2 className="text-small text-foreground">{title}</h2>
        {year ? <p className="text-small text-muted">{year}</p> : null}
        {discipline.length > 0 ? (
          <p className="text-small text-muted">{discipline.join(" + ")}</p>
        ) : null}
      </div>
      <p className="text-small text-foreground font-light">{summary}</p>
    </section>
  );
}
