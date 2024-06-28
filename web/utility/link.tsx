import { Item } from "../hooks/items";

export function magicedenLink(item: Item): string {
  return `https://magiceden.io/marketplace/${item.address}`;
}

export function tensorLink(item: Item): string {
  const slug = "owner" in item ? "item" : "trade";
  return `https://tensor.trade/${slug}/${item.address}`;
}
