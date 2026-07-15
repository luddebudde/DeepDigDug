import { Assets, Texture } from "pixi.js";
import { itemPlaceholds } from "../inventory/items";
import { Integer } from "../findWorldBlocks";

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
    durability: 80,
    png: "new_dirt_texture.png", // TODO: replace with mushroom earth texture
    drop: { item: "earth", amount: 1 },
  },
  mushroomCap: {
    name: "mushroomCap",
    density: 0.0005,
    resitution: 0.1,
    solid: true,
    durability: 40,
    png: "coal_texture.png", // TODO: replace with mushroom cap texture
    drop: { item: "coal", amount: 1 },
  },
  crystal: {
    name: "crystal",
    density: 0.002,
    resitution: 0.5,
    solid: true,
    durability: 500,
    png: "diamond_ore.png", // TODO: replace with crystal texture
    drop: { item: "diamond", amount: 1 },
  },
} as const;

export const materialKeys = Object.keys(
  materials
) as (keyof typeof materials)[];
const materialIdMap = new Map<string, number>(
  materialKeys.map((key, index) => [key, index])
);

type TextureMap = Record<string, Texture>;

export const assets: TextureMap = Object.fromEntries(
  await Promise.all(
    materialKeys.map(async (key) => {
      const mat = materials[key];
      const texture = mat.solid ? await Assets.load(mat.png) : Texture.EMPTY;
      return [key, texture] as [string, Texture];
    })
  )
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
