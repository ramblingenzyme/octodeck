import type { KnownItem } from "@/types";

/** Returns the primary display text for any column item type. */
export function getItemDisplayText(item: KnownItem): string {
  if ("title" in item) return item.title;
  if ("name" in item) return item.name;
  return item.text;
}
