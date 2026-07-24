import type { ReviewRequest } from "./types";

export interface OrderGroups {
  active: ReviewRequest[];
  previews: ReviewRequest[];
  closed: ReviewRequest[];
}

export function groupOrderRequests(items: readonly ReviewRequest[]): OrderGroups {
  return items.reduce<OrderGroups>((groups, item) => {
    if (item.status === "CANCELLED") groups.closed.push(item);
    else if (item.status === "DRAFT_PREVIEW") groups.previews.push(item);
    else groups.active.push(item);
    return groups;
  }, { active: [], previews: [], closed: [] });
}
