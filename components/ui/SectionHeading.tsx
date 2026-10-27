import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div className={`mb-12 flex flex-col gap-5 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={`max-w-3xl ${centered ? "mx-auto" : ""}`}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="heading text-4xl leading-[1.05] sm:text-6xl">{title}</h2>
        {body && <p className={`mt-5 max-w-xl text-[15px] leading-relaxed text-muted ${centered ? "mx-auto" : ""}`}>{body}</p>}
      </div>
      {action && (
        <Link href={action.href} className={`btn btn-outline btn-sm shrink-0 border-line ${centered ? "" : "self-start md:self-auto"}`}>
          {action.label} ↗
        </Link>
      )}
    </div>
  );
}
