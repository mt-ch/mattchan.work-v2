import { blobatarUri } from "blobatar/uri";

export function Avatar() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated data URI, nothing to optimise
    <img
      src={blobatarUri("Matt Chan")}
      alt=""
      width={64}
      height={64}
      className="size-16 rounded-full"
    />
  );
}
