import { memo } from "react";

export const Section = memo(function Section({
  id,
  eyebrow,
  title,
  children,
  ariaLabel,
}) {
  return (
    <section id={id} className="section" aria-labelledby={ariaLabel || undefined}>
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={ariaLabel || undefined}>{title}</h2>
        {children}
      </div>
    </section>
  );
});
