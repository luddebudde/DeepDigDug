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
};

// CHANGE MATERIAL NAMES
export const materials: Record<string, Material> = {
  air: {
    name: "air",
    density: 0,
    resitution: 0,
    png: "coal_texture",
    solid: false,
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
