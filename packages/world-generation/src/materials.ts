import { type Integer } from "@repo/math/src/random";

export type Material = {
  name: string;
  density: number;
  resitution: number;
  png: string;
  solid: boolean;
  durability: number;
  drop?: {
    item: keyof typeof itemPlaceholds;
    amount: number;
  };
};

// CHANGE MATERIAL NAMES
export const materials: Record<string, Material> = {
  air: {
    name: "air",
    density: 0,
    resitution: 0,
    durability: 0,
    png: "coal_texture",

    solid: false,
  },
  earth: {
    name: "earth",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 100,
    png: "new_dirt_texture.png",
    drop: { item: "earth", amount: 1 },
  },
  grass: {
    name: "grass",
    density: 0.0005,
    resitution: 0.2,
    solid: true,
    durability: 100,
    png: "grass_texture.png",
    drop: { item: "earth", amount: 1 },
  },
  snow: {
    name: "snow",
    density: 0.0005,
    resitution: 0.2,
    solid: true,
    durability: 60,
    png: "snow_texture.png",
    drop: { item: "snow", amount: 1 },
  },
  rock: {
    name: "rock",
    density: 0.002,
    resitution: 0.2,
    solid: true,
    durability: 200,
    png: "stone_texture.png",
    drop: { item: "rock", amount: 1 },
  },
  ice: {
    name: "ice",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 100,
    png: "ice_texture.png",
    drop: { item: "ice", amount: 1 },
  },
  treeOre: {
    name: "treeOre",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 300,
    png: "tree_ore.png",
    drop: { item: "treeOre", amount: 1 },
  },
  ancientTreeOre: {
    name: "ancientTreeOre",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 800,
    png: "ancient_tree_ore.png",
    drop: { item: "treeOre", amount: 16 },
  },
  coal: {
    name: "coal",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 250,
    png: "coal_texture.png",
    drop: { item: "coal", amount: 1 },
  },
  iron: {
    name: "iron",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 300,
    png: "silver_ore.png",
    drop: { item: "iron", amount: 1 },
  },
  diamond: {
    name: "diamond",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 1000,
    png: "diamond_ore.png",
    drop: { item: "diamond", amount: 1 },
  },
  rubber: {
    name: "rubber",
    density: 0.0002,
    resitution: 1,
    solid: true,
    durability: 0,
    png: "pickaxe_sprite.png",
  },
  mushroomEarth: {
    name: "mushroomEarth",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    durability: 40,
    png: "mushroom_earth.png", // TODO: replace with mushroom earth texture
    drop: { item: "mushroomEarth", amount: 1 },
  },
  mushroomOre: {
    name: "mushroomOre",
    density: 0.0005,
    resitution: 0.1,
    solid: true,
    durability: 200,
    png: "mushroom_ore.png", // TODO: replace with mushroom cap texture
    drop: { item: "mushroomOre", amount: 1 },
  },
  obsidian: {
    name: "obsidian",
    density: 0.002,
    resitution: 0.5,
    solid: true,
    durability: 800,
    png: "obsidian_texture.png", // TODO: replace with crystal texture
    drop: { item: "obsidian", amount: 1 },
  },
  amethyst: {
    name: "amethyst",
    density: 0.002,
    resitution: 0.5,
    solid: true,
    durability: 250,
    png: "amethyst_ore.png", // TODO: replace with crystal texture
    drop: { item: "amethyst", amount: 1 },
  },
  water: {
    name: "water",
    density: 0.002,
    resitution: 0.5,
    solid: true,
    durability: 250,
    png: "dirt_texture.png", // TODO: replace png
  },
} as const;

export const materialKeys = Object.keys(
  materials
) as (keyof typeof materials)[];
const materialIdMap = new Map<string, number>(
  materialKeys.map((key, index) => [key, index])
);

export const getMaterialId = (key: keyof typeof materials): number => {
  const id = materialIdMap.get(key);
  if (id === undefined) {
    throw new Error(`Unknown material key: ${key}`);
  }
  return id;
};

export const getMaterial = (int: Integer): Material => {
  const key = materialKeys[int];
  if (key === undefined) {
    throw new Error(`Unknown material id: ${int}`);
  }
  return materials[key];
};

// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION
// GREAT LINE OF SEGREGATION

export type ItemPlacehold = {
  name: string;
  stackSize: number;
  png: string;
  placeable: boolean;
  opacity?: number;
};

// CHANGE MATERIAL NAMES
export const itemPlaceholds: Record<string, ItemPlacehold> = {
  earth: {
    // Original: 256
    name: "Earth",
    stackSize: 256,
    placeable: true,
    png: materials.earth.png,
  },
  rock: {
    name: "Rock",
    stackSize: 256,
    placeable: true,
    png: materials.rock.png,
  },
  treeOre: {
    name: "Tree ore",
    stackSize: 128,
    placeable: true,
    png: materials.treeOre.png,
  },
  coal: {
    name: "Coal",
    stackSize: 64,
    placeable: true,
    png: materials.coal.png,
  },
  iron: {
    name: "Iron",
    stackSize: 64,
    placeable: true,
    png: materials.iron.png,
  },
  diamond: {
    name: "Diamond",
    stackSize: 16,
    placeable: true,
    png: materials.diamond.png,
  },
  snow: {
    name: "Snow",
    stackSize: 256,
    placeable: true,
    png: materials.snow.png,
  },
  ice: {
    name: "Ice",
    stackSize: 64,
    placeable: true,
    png: materials.ice.png,
  },
  mushroomEarth: {
    name: "mushroomEarth",
    stackSize: 256,
    placeable: true,
    png: materials.mushroomEarth.png,
  },
  mushroomOre: {
    name: "mushroomOre",
    stackSize: 64,
    placeable: true,
    png: materials.mushroomOre.png,
  },
  amethyst: {
    name: "amethyst",
    stackSize: 32,
    placeable: true,
    png: materials.amethyst.png,
  },
  obsidian: {
    name: "obsidian",
    stackSize: 256,
    placeable: true,
    png: materials.obsidian.png,
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
