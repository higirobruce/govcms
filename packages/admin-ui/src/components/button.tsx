import * as React from "react";
import { cn } from "../lib/cn";

export type ButtonVariant =
  | "default"
  | "primary"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "default" | "sm" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT: Record<ButtonVariant, string> = {
  default: "",
  primary: "btn-primary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "btn",
        VARIANT[variant],
        size === "sm" && "btn-sm",
        size === "icon" && "btn-icon",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
