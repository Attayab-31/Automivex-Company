import { memo } from "react";

export const Section = memo(function Section({
  id,
  eyebrow,
  title,
  children,
}) {
  return (
    <section id={id} className="section">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
});
