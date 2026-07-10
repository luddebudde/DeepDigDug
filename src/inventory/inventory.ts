import { ItemPlacehold } from "./items";

export type Inventory = {
  hotbarSize: number;
  selectedHotbarSlot: number;
  stackSize: number;
  slots: number;
  content: (Slot | undefined)[];
};

export type Slot = {
  item: ItemPlacehold;
  amount: number;
  maxStackSize: number;
  placeable: boolean;
};

const slotAmount = 40;

export const inventory: Inventory = {
  hotbarSize: 8,
  selectedHotbarSlot: 0,
  stackSize: 64,
  slots: slotAmount,
  content: new Array(slotAmount),
};

// --- pub/sub so React components can react to inventory mutations ---
type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeToInventory = (fn: Listener): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const notifyInventoryChanged = () => listeners.forEach((fn) => fn());
