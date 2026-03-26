import type { PropsWithChildren } from "react";

export function Panel(props: PropsWithChildren<{ className?: string; title?: string; subtitle?: string }>) {
  return (
    <section className={`panel ${props.className || ""}`}>
      {props.title ? (
        <header className="panel-header">
          <div>
            <h2>{props.title}</h2>
            {props.subtitle ? <p>{props.subtitle}</p> : null}
          </div>
        </header>
      ) : null}
      {props.children}
    </section>
  );
}
