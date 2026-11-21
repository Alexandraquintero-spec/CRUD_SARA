import * as React from "react";
import { Chip } from "@heroui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/*
 * Etiqueta de SARA basada en el Chip de HeroUI v3.
 * Conserva el nombre Badge y la prop variant para no romper las pantallas.
 */

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-sara-green text-white",
      secondary: "bg-sara-green-50 text-sara-green-dark",
      destructive: "bg-red-50 text-red-700",
      outline: "border border-sara-line text-sara-ink",
    },
  },
  defaultVariants: { variant: "default" },
});

type LegacyVariant = "default" | "secondary" | "destructive" | "outline";

const MAP: Record<LegacyVariant, { color: "accent" | "default" | "danger"; variant: "primary" | "soft" | "secondary" | "tertiary" }> = {
  default: { color: "accent", variant: "soft" },
  secondary: { color: "default", variant: "secondary" },
  destructive: { color: "danger", variant: "soft" },
  outline: { color: "default", variant: "tertiary" },
};

type BadgeProps = React.ComponentProps<"span"> & { variant?: LegacyVariant | null; asChild?: boolean };

function Badge({ className, variant, children, asChild: _asChild, ...props }: BadgeProps) {
  const m = MAP[(variant ?? "default") as LegacyVariant];
  return (
    <Chip size="sm" color={m.color} variant={m.variant} className={cn("gap-1 font-medium", className)} {...(props as object)}>
      {children}
    </Chip>
  );
}

export { Badge, badgeVariants };
export type { VariantProps };
