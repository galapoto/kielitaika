import { AlertCircle, CheckCircle2, Info } from "lucide-react";
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

  const Marker = props.tone === "error" ? AlertCircle : props.tone === "success" ? CheckCircle2 : Info;

  return (
    <div className={`status-banner status-${props.tone}`}>
      <span className="status-marker" aria-hidden="true">
        <Marker size={16} aria-hidden="true" />
      </span>
      <div className="status-copy">
        <strong>{props.title}</strong>
        <p>{props.message}</p>
      </div>
    </div>
  );
}
