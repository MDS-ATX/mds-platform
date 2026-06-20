import { getFullInventory, getLiveInventory } from "@/lib/inventory/data";
import { InventoryClient } from "./inventory-client";

export const metadata = {
  title: "Sales Inventory | Concourse & Iris Admin",
};

// Always render fresh so the official sheet (source of truth) shows on load.
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  let inventory;
  try {
    inventory = await getLiveInventory();
  } catch {
    inventory = getFullInventory();
  }
  return <InventoryClient inventory={inventory} />;
}
