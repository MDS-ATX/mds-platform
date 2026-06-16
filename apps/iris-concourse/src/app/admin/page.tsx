import { getFullInventory, getLiveInventory } from "@/lib/inventory/data";
import { InventoryClient } from "./inventory-client";

export const metadata = {
  title: "Sales Inventory | Concourse & Iris Admin",
};

// Always render fresh so saved status/notes overrides show on load.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let inventory;
  try {
    inventory = await getLiveInventory();
  } catch {
    inventory = getFullInventory();
  }
  return <InventoryClient inventory={inventory} />;
}
