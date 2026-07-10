import { rgb } from "../color";

export type Material = {
  name: string;
  density: number;
  resitution: number;
  png: string;
  solid: boolean;
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
    png: "dirt_texture.png",
  },
  grass: {
    name: "grass",
    density: 0.0005,
    resitution: 0.2,
    solid: true,
    png: "ladder_sprite.png",
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
  },
  ice: {
    name: "ice",
    density: 0.001,
    resitution: 0.2,
    opacity: 0.8,
    solid: true,
    png: "silver_ore.png",
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
