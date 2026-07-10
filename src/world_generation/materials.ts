import { Assets, Texture } from "pixi.js";
import { itemPlaceholds } from "../inventory/items";

export type Material = {
  name: string;
  density: number;
  resitution: number;
  png: string;
  solid: boolean;
  drop?: {
    item: keyof typeof itemPlaceholds;
    amount: number;
  }; // just a string key
  opacity?: number;
};

// CHANGE MATERIAL NAMES
export const materials: Record<string, Material> = {
  air: {
    name: "air",
    density: 0,
    resitution: 0,
    png: "coal_texture",
    solid: false,
    opacity: 0,
  },
  earth: {
    name: "earth",
    density: 0.001,
    resitution: 0.2,
    solid: true,
    png: "new_dirt_texture.png",
    drop: { item: "earth", amount: 1 },
  },
  grass: {
    name: "grass",
    density: 0.0005,
    resitution: 0.2,
    solid: true,
    png: "grass_texture.png",
    drop: { item: "earth", amount: 5 },
  },
  snow: {
    name: "snow",
    density: 0.0005,
    resitution: 0.2,
    solid: true,
    png: "diamond_ore.png",
  },
  rock: {
    name: "rock",
    density: 0.002,
    resitution: 0.2,
    solid: true,
    png: "stone_texture.png",
    drop: { item: "rock", amount: 1 },
  },
  ice: {
    name: "ice",
    density: 0.001,
    resitution: 0.2,
    opacity: 0.8,
    solid: true,
    png: "silver_ore.png",
    drop: { item: "rock", amount: 1 },
  },
  rubber: {
    name: "rubber",
    density: 0.0002,
    resitution: 1,
    solid: true,
    png: "pickaxe_sprite.png",
  },
} as const;

export const materialKeys = Object.keys(
  materials
) as (keyof typeof materials)[];
const materialIdMap = new Map<string, number>(
  materialKeys.map((key, index) => [key, index])
);

type TextureMap = Record<string, Texture>;

// const assets: Assets = {
//   air: Texture.EMPTY,
//   rock: await Assets.load("stone_texture.png"),
//   earth: await Assets.load("dirt_texture.png"),
//   grass: await Assets.load("ladder_sprite.png"),
//   snow: await Assets.load("diamond_ore.png"),
//   ice: await Assets.load("silver_ore.png"),
//   rubber: await Assets.load("pickaxe_sprite.png"),
// };
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

export const getMaterial = (id: number): Material => {
  const key = materialKeys[id];
  if (key === undefined) {
    throw new Error(`Unknown material id: ${id}`);
  }
  return materials[key];
};
