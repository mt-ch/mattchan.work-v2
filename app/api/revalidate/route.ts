// React and Next.js
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

// Third-party libraries
import { parseBody } from "next-sanity/webhook";

// Shared modules
import {
  type RevalidationPayload,
  tagsForDocument,
} from "@/lib/sanity/revalidation";

/**
 * Sanity webhook handler that invalidates the cache tags of a changed document.
 *
 * @param req - The signed webhook request from Sanity.
 * @returns 200 with the revalidated tags, 400 without a `_type`, 401 for a bad
 * signature, or 500 when the secret isn't configured.
 */
export async function POST(req: NextRequest) {
  // Refuse to run unauthenticated if the secret is missing
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );
  }

  // Verify the signature and read the payload
  const { isValidSignature, body } = await parseBody<RevalidationPayload>(
    req,
    secret,
  );
  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }
  if (!body?._type) {
    return NextResponse.json({ message: "Missing _type" }, { status: 400 });
  }

  // Invalidate every tag the document feeds
  const revalidated = tagsForDocument(body);
  for (const tag of revalidated) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated });
}
