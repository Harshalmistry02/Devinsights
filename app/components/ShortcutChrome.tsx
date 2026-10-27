"use client";

import { usePathname } from "next/navigation";
import {
  KeyboardShortcuts,
  KeyboardShortcutsHelp,
} from "@/components/dashboard/KeyboardShortcuts";

/**
 * Keyboard affordances belong to the signed-in app, not the marketing or
 * authentication surfaces.
 */
export function ShortcutChrome() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") return null;

  return (
    <>
      <KeyboardShortcuts />
      <KeyboardShortcutsHelp />
    </>
  );
}
