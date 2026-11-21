import * as React from "react";
import { Input as HeroInput } from "@heroui/react";

import { cn } from "./utils";

/* Campo de texto de SARA basado en el Input de HeroUI v3 (acepta los atributos nativos de <input>). */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <HeroInput ref={ref} fullWidth className={cn("w-full", className)} {...(props as object)} />
  ),
);
Input.displayName = "Input";

export { Input };
