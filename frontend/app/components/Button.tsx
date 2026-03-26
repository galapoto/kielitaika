import type { ButtonHTMLAttributes, MouseEvent, PropsWithChildren } from "react";

import { playTap } from "../services/audioService";

export function Button(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "secondary" | "danger" | "ghost" }>,
) {
  const tone = props.tone || "primary";
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!props.disabled) {
      playTap();
    }
    props.onClick?.(event);
  }
  return (
    <button {...props} onClick={handleClick} className={`button button-${tone} ${props.className || ""}`.trim()}>
      {props.children}
    </button>
  );
}
