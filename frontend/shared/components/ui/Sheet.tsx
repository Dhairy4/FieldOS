"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../utils";

/** Slide-in drawer built on Radix Dialog (focus trap, ESC, scroll lock). */
export function Sheet({
  open,
  onOpenChange,
  title,
  side = "left",
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: "left" | "bottom";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-50 bg-surface shadow-pop focus:outline-none",
            side === "left" &&
              "inset-y-0 left-0 w-[17rem] max-w-[85vw] animate-slide-in-left border-r border-border",
            side === "bottom" &&
              "inset-x-0 bottom-0 max-h-[85vh] animate-slide-up rounded-t-xl border-t border-border pb-safe",
            className
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Close
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
