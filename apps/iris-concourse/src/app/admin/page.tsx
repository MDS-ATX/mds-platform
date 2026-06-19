import { getFullInventory } from "@/lib/inventory/data";
import { InventoryClient } from "./inventory-client";

export const metadata = {
  title: "Sales Inventory | Concourse & Iris Admin",
};

export default function AdminPage() {
  const inventory = getFullInventory();
  return <InventoryClient inventory={inventory} />;
}
