import * as React from "react";
import { cn } from "../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply the standard inner padding. */
  pad?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ pad, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card", pad && "card-pad", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHead = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-head", className)} {...props} />
));
CardHead.displayName = "CardHead";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={className} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-pad", className)} {...props} />
));
CardBody.displayName = "CardBody";
