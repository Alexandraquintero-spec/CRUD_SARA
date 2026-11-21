import * as React from "react";
import { Card as HeroCard } from "@heroui/react";

import { cn } from "./utils";

/*
 * Tarjeta de SARA basada en HeroUI v3 (Card, Card.Header, Card.Title, Card.Description,
 * Card.Content, Card.Footer). Conserva los nombres anteriores (CardHeader, CardTitle...).
 */

type DivProps = React.ComponentProps<"div">;

function Card({ className, ...props }: DivProps) {
  return <HeroCard className={cn("border border-sara-line shadow-none", className)} {...props} />;
}

function CardHeader({ className, ...props }: DivProps) {
  return <HeroCard.Header className={className} {...props} />;
}

function CardTitle({ className, ...props }: DivProps) {
  return <HeroCard.Title className={cn("text-base font-semibold text-sara-ink", className)} {...(props as object)} />;
}

function CardDescription({ className, ...props }: DivProps) {
  return <HeroCard.Description className={className} {...(props as object)} />;
}

function CardContent({ className, ...props }: DivProps) {
  return <HeroCard.Content className={className} {...props} />;
}

function CardFooter({ className, ...props }: DivProps) {
  return <HeroCard.Footer className={className} {...props} />;
}

function CardAction({ className, ...props }: DivProps) {
  return <div className={cn("ml-auto self-start", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
