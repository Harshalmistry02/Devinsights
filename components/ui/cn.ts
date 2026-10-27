import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system uses custom typography utilities such as `text-nav` and
 * `text-value`. Tell tailwind-merge they are font sizes, otherwise it treats
 * them as text colours and drops them when a colour is also applied.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-hero",
        "text-page-title",
        "text-section-head",
        "text-card-title",
        "text-label",
        "text-body",
        "text-caption",
        "text-caption-bold",
        "text-micro",
        "text-value",
        "text-nav",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
