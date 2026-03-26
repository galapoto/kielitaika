import { AtSign, FilePenLine, LockKeyhole, MessageSquareText, UserRound, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

function resolveInputIcon(label: string, type: string | undefined): LucideIcon {
  if (type === "email") {
    return AtSign;
  }
  if (type === "password") {
    return LockKeyhole;
  }
  if (label.toLowerCase().includes("name")) {
    return UserRound;
  }
  return FilePenLine;
}

export function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const FieldIcon = resolveInputIcon(props.label, props.type);
  return (
    <label className="field">
      <span className="field-label">
        <FieldIcon size={16} aria-hidden="true" />
        <span>{props.label}</span>
      </span>
      <input {...props} />
    </label>
  );
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="field">
      <span className="field-label">
        <MessageSquareText size={16} aria-hidden="true" />
        <span>{props.label}</span>
      </span>
      <textarea {...props} />
    </label>
  );
}
