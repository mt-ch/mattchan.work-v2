export { viewport } from "next-sanity/studio";

/**
 * Layout for the embedded Sanity Studio at `/studio`.
 *
 * @param props.children - The Studio page.
 * @returns The page, unchanged.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
