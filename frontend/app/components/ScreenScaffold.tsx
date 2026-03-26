import type { PropsWithChildren, ReactNode } from "react";

export function ScreenScaffold(props: PropsWithChildren<{
  className?: string;
  header?: ReactNode;
  actions?: ReactNode;
  centerContent?: boolean;
  contentClassName?: string;
}>) {
  return (
    <div className={`screen-shell ${props.centerContent ? "center-content" : ""} ${props.className || ""}`.trim()}>
      {props.header ? <div className="screen-header-zone">{props.header}</div> : null}
      <div className={`screen-content-zone ${props.contentClassName || ""}`.trim()}>{props.children}</div>
      {props.actions ? <div className="screen-action-zone">{props.actions}</div> : null}
    </div>
  );
}
