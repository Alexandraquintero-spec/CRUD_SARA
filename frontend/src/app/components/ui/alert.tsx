import * as React from "react";
import { Alert as HeroAlert } from "@heroui/react";

import { cn } from "./utils";

/*
 * Alerta de SARA basada en HeroUI v3 (Alert, Alert.Indicator, Alert.Content,
 * Alert.Title, Alert.Description). Conserva Alert / AlertTitle / AlertDescription.
 */

type AlertProps = React.ComponentProps<"div"> & {
  variant?: "default" | "destructive" | null;
  status?: "default" | "accent" | "success" | "warning" | "danger";
};

function Alert({ className, variant, status, children, ...props }: AlertProps) {
  const s = status ?? (variant === "destructive" ? "danger" : "accent");
  return (
    <HeroAlert status={s} className={cn(className)} {...(props as object)}>
      <HeroAlert.Indicator />
      <HeroAlert.Content>{children}</HeroAlert.Content>
    </HeroAlert>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <HeroAlert.Title className={className} {...(props as object)} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <HeroAlert.Description className={className} {...(props as object)} />;
}

export { Alert, AlertTitle, AlertDescription };
