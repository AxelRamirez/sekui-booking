import type { PhotoKey } from "@/lib/content/images";
import { Photo } from "./Photo";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  image,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: PhotoKey;
  children?: React.ReactNode;
}) {
  return (
    <section className="container-page pt-14 pb-10 text-center">
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <h1 className="heading mx-auto max-w-4xl text-5xl leading-[1.02] sm:text-7xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">{subtitle}</p>}
      {children}
      {image && (
        <div className="relative mt-12 aspect-[21/9] overflow-hidden rounded-card">
          <Photo name={image} alt="" preload />
        </div>
      )}
    </section>
  );
}
