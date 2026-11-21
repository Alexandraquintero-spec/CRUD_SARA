import * as React from "react";
import { Button as HeroButton } from "@heroui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/*
 * Botón de SARA basado en HeroUI v3.
 * Conserva la API anterior (variant, size, onClick, disabled) para que todas las
 * pantallas sigan funcionando, pero el render, los estados y la accesibilidad
 * son los de HeroUI.
 */

// Se conserva para los componentes que aún lo importan (calendar, pagination, alert-dialog).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sara-green text-white hover:bg-sara-green-dark",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-sara-line bg-white text-sara-ink hover:bg-sara-green-50",
        secondary: "bg-sara-green-50 text-sara-green-dark hover:bg-sara-green-100",
        ghost: "hover:bg-sara-green-50 text-sara-ink",
        link: "text-sara-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3",
        lg: "h-11 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type LegacyVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type LegacySize = "default" | "sm" | "lg" | "icon";

const VARIANT: Record<LegacyVariant, "primary" | "danger" | "outline" | "secondary" | "ghost"> = {
  default: "primary",
  destructive: "danger",
  outline: "outline",
  secondary: "secondary",
  ghost: "ghost",
  link: "ghost",
};

const SIZE: Record<LegacySize, "sm" | "md" | "lg"> = { default: "md", sm: "sm", lg: "lg", icon: "md" };

type ButtonProps = Omit<React.ComponentProps<"button">, "color"> & {
  variant?: LegacyVariant | null;
  size?: LegacySize | null;
  asChild?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, onClick, disabled, type, style, children, asChild: _asChild, ...rest }, ref) => {
    const v = (variant ?? "default") as LegacyVariant;
    const s = (size ?? "default") as LegacySize;
    return (
      <HeroButton
        ref={ref}
        variant={VARIANT[v]}
        size={SIZE[s]}
        isIconOnly={s === "icon"}
        isDisabled={disabled}
        type={type}
        style={style}
        className={cn("gap-2", v === "link" && "underline-offset-4 hover:underline", className)}
        onPress={onClick ? (e) => onClick(e as unknown as React.MouseEvent<HTMLButtonElement>) : undefined}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </HeroButton>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { VariantProps };
