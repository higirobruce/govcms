import * as React from "react";
import { cn } from "../lib/cn";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: React.ReactNode;
  htmlFor?: string;
}

/** A labelled form field: label row (with Required/Optional), control, hint. */
export function Field({
  label,
  required,
  optional,
  hint,
  htmlFor,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("field", className)} {...props}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          <span>{label}</span>
          {required && <span className="req">Required</span>}
          {optional && <span className="opt">Optional</span>}
        </label>
      )}
      {children}
      {hint && (
        <div className="muted t12" style={{ marginTop: 5 }}>
          {hint}
        </div>
      )}
    </div>
  );
}
