import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <input {...props} />
    </label>
  );
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <textarea {...props} />
    </label>
  );
}
