import type { PRItem, IssueItem, CIItem, NotifItem, ActivityItem } from '@/types';

type AnyItem = PRItem | IssueItem | CIItem | NotifItem | ActivityItem;

/** Returns the primary display text for any column item type. */
export function getItemDisplayText(item: AnyItem): string {
  if ('title' in item) return item.title;
  if ('name' in item) return item.name;
  return item.text;
}
