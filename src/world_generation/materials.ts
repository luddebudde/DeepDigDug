import { rgb } from "../color";

export type Material = {
  color: (value: number) => string;
  density: number;
  resitution: number;
  png: string;
  opacity?: number;
};

export const materials: Record<string, Material> = {
  earth: {
    color: (value: number) =>
      rgb(value * 0.6, value * 0.64 * 0.6, value * 0 * 0.6),
    density: 0.001,
    resitution: 0.2,
    png: "dirt_texture.png",
  },
  grass: {
    color: (val: number) => rgb(val * 0, val * 1, val * 0),
    density: 0.0005,
    resitution: 0.2,
    png: "ladder_sprite.png",
  },
  snow: {
    color: (val: number) => rgb(0.9, 0.9, 0.9),
    density: 0.0005,
    resitution: 0.2,
    png: "diamond_ore.png",
  },
  rock: {
    color: (val: number) => rgb(val * 0.5, val * 0.5, val * 0.5),
    density: 0.002,
    resitution: 0.2,
    png: "stone_texture.png",
  },

  ice: {
    color: (val: number) => rgb(val * 0.5, val * 0.7, val * 1),
    density: 0.001,
    resitution: 0.2,
    opacity: 0.8,
    png: "silver_ore.png",
  },
  rubber: {
    color: (val: number) => rgb(val * 0.8, val * 0.3, val * 0.3),
    density: 0.0002,
    resitution: 1,
    png: "pickaxe_sprite.png",
  },
} as const;
