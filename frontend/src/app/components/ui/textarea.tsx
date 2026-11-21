import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-sh-input placeholder:text-sh-muted-foreground focus-visible:border-sh-ring focus-visible:ring-sh-ring/50 aria-invalid:ring-sh-destructive/20 dark:aria-invalid:ring-sh-destructive/40 aria-invalid:border-sh-destructive dark:bg-sh-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-sh-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
