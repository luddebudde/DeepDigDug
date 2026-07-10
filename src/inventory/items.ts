import { Material, materials } from "../world_generation/materials";

export type ItemPlacehold = {
  stackSize: number;
  png: string;
  placeable: boolean;
  opacity?: number;
};

// CHANGE MATERIAL NAMES
export const itemPlaceholds: Record<string, ItemPlacehold> = {
  earth: {
    // Original: 256
    stackSize: 3,
    placeable: true,
    png: materials.earth.png,
  },
  rock: {
    stackSize: 128,
    placeable: true,
    png: materials.rock.png,
  },
  //   grass: {
  //     color: (val: number) => rgb(val * 0, val * 1, val * 0),
  //     density: 0.0005,
  //     resitution: 0.2,
  //     solid: true,
  //     png: "ladder_sprite.png",
  //   },
  //   snow: {
  //     color: (val: number) => rgb(0.9, 0.9, 0.9),
  //     density: 0.0005,
  //     resitution: 0.2,
  //     solid: true,
  //     png: "diamond_ore.png",
  //   },
} as const;

export const itemKeys = Object.keys(
  itemPlaceholds
) as (keyof typeof itemPlaceholds)[];
const materialIdMap = new Map<string, number>(
  itemKeys.map((key, index) => [key, index])
);

export const getItemlId = (key: keyof typeof itemPlaceholds): number => {
  const id: number = materialIdMap.get(key)!;

  return id;
};

export const getItem = (id: number): ItemPlacehold => {
  const key = itemKeys[id];
  if (key === undefined) {
    throw new Error(`Unknown material id: ${id}`);
  }
  return itemPlaceholds[key];
};
export const getMaterialFromItem = (
  item: ItemPlacehold
): Material | undefined => {
  const key = itemKeys.find((k) => itemPlaceholds[k] === item);
  if (key === undefined) return undefined;
  return materials[key];
};
