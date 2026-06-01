import * as React from "react";
import { cn } from "../lib/cn";

/** Workflow statuses — the flag palette maps onto these:
 *  approved = blue, review = sun/amber, published = green, changes = red. */
export type BadgeStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "changes";

const STATUS: Record<BadgeStatus, { cls: string; label: string }> = {
  draft: { cls: "badge-draft", label: "Draft" },
  review: { cls: "badge-review", label: "In review" },
  approved: { cls: "badge-approved", label: "Approved" },
  published: { cls: "badge-published", label: "Published" },
  changes: { cls: "badge-changes", label: "Changes requested" },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  /** Show the leading status dot. */
  dot?: boolean;
}

export function Badge({
  status = "draft",
  dot,
  className,
  children,
  ...props
}: BadgeProps) {
  const s = STATUS[status] ?? STATUS.draft;
  return (
    <span className={cn("badge", s.cls, className)} {...props}>
      {dot && <span className="dotc" />}
      {children ?? s.label}
    </span>
  );
}
