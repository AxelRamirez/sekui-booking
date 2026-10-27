import Image from "next/image";
import { photo, type PhotoKey } from "@/lib/content/images";

/** Fills its (relative) parent with a placeholder photo. */
export function Photo({
  name,
  alt,
  sizes = "100vw",
  preload = false,
  className = "",
}: {
  name: PhotoKey;
  alt: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={photo(name)}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      loading={preload ? "eager" : undefined}
      className={`object-cover ${className}`}
    />
  );
}
