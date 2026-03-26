import { useEffect } from "react";

import { playError, playSuccess } from "../services/audioService";

export function StatusBanner(props: { tone: "neutral" | "success" | "error"; title: string; message: string }) {
  useEffect(() => {
    if (props.tone === "error") {
      playError();
      return;
    }
    if (props.tone === "success") {
      playSuccess();
    }
  }, [props.message, props.title, props.tone]);

  const marker = props.tone === "error" ? "!" : props.tone === "success" ? "OK" : "i";

  return (
    <div className={`status-banner status-${props.tone}`}>
      <span className="status-marker" aria-hidden="true">
        {marker}
      </span>
      <div className="status-copy">
        <strong>{props.title}</strong>
        <p>{props.message}</p>
      </div>
    </div>
  );
}
