/* The small shared pieces. Each of these appears in three or more places —
   that was the bar for pulling it out of the view that first needed it. */

export function Card({ className = "", children, ...rest }) {
  return (
    <section className={`card ${className}`.trim()} {...rest}>
      {children}
    </section>
  );
}

export function Button({ variant = "primary", className = "", children, ...rest }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

export function GhostButton({ className = "", children, ...rest }) {
  return (
    <button className={`ghost-btn ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

export function IconButton({ className = "", children, ...rest }) {
  return (
    <button className={`icon-btn ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function EmptyNote({ children }) {
  return <p className="empty-note">{children}</p>;
}

export function Field({ label, hint, htmlFor, children }) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
