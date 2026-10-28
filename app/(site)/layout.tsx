/**
 * Route group layout for the public site. Renders no chrome of its own, so
 * `/studio` stays separate; pages compose `SiteShell` themselves.
 *
 * @param props.children - The matched page.
 * @returns The page, unchanged.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
