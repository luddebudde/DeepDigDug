import { Integer } from "../findWorldBlocks";
import { getMaterial } from "../world_generation/materials";
import { inventory, notifyInventoryChanged, Slot } from "./inventory";
import { getItem, getItemlId } from "./items";

export const addToInventory = (materialId: Integer) => {
  const material = getMaterial(materialId);
  if (material.drop === undefined) {
    console.log(
      "item does not exist in item format; failed to find material.drop"
    );

    return;
  }
  const itemId = getItemlId(material.drop.item);
  // If amount + already existing amount exceedes the max slot cap, the slot will overstack
  const amount = material.drop.amount;

  const item = getItem(itemId);

  const unFilledSlot = inventory.content
    .filter((slot: Slot | undefined) => slot !== undefined)
    .find(
      (slot: Slot) => slot.item === item && slot.maxStackSize > slot.amount
    );

  // If there is no available slot to fill, create new
  if (unFilledSlot === undefined) {
    // If inventory is full, return false and reject item-pickup

    // This might crash, since content is now always filled (but with undefined)
    if (inventory.content.length > inventory.slots) return false;
    const newSlot: Slot = {
      item,
      amount,
      maxStackSize: item.stackSize,
    };

    const emptySlotIndex = inventory.content.findIndex(
      (slot: Slot | undefined) => slot === undefined
    );

    if (emptySlotIndex !== -1) {
      inventory.content[emptySlotIndex] = newSlot;
    } else {
      inventory.content.push(newSlot);
    }

    // inventory.content.push(newSlot);
    // console.log("new slot:", newSlot);
  } else {
    unFilledSlot.amount += amount;
    // console.log("existing slot:", preExistingSlot);
  }
  notifyInventoryChanged();
};

export const removeFromInventory = (slot: Slot, amount: number) => {
  slot.amount -= amount;
  if (slot.amount <= 0) {
    const idx = inventory.content.indexOf(slot);
    if (idx !== -1) inventory.content[idx] = undefined;
  }
  notifyInventoryChanged();
};
