import { useEffect, useReducer } from "react";
import { Inventory, inventory, subscribeToInventory } from "./inventory";

/**
 * Returns the shared `inventory` object and re-renders the component
 * automatically whenever `notifyInventoryChanged()` is called.
 */
export const useInventory = (): Inventory => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    return subscribeToInventory(forceUpdate);
  }, []);

  return inventory;
};
