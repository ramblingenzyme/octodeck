import type { KnownItem } from "@/types";

/** Returns the primary display text for any column item type. */
export function getItemDisplayText(item: KnownItem): string {
  if ("title" in item) return item.title;
  if ("summary" in item) return item.summary;
  if ("environment" in item) return item.environment;
  if ("tag" in item) return item.tag;
  if ("name" in item) return item.name;
  return item.text;
}
