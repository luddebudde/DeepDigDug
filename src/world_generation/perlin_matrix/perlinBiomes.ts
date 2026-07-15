import { perlin } from "../../math/perlin";
import { Material, materials } from "../materials";
import {
  blockSize,
  cavesThresHold,
  horizontalBoxes,
  verticalBoxes,
  worldWidth,
} from "../perlinConstants";
import { surfaceLevel } from "./perlinSurface";

// perlinBiomes.ts
export type SurfaceBiome = {
  name: string;
  grass: string;
  earth: string;
  rock: string;

  airThreshold: number;
  oreFilter: [Material, number][];
};

type UndergroundBiome = {
  minDepth: number; // relDepth threshold before this biome can spawn
  airThreshold: number; // how hollow the caves are (higher = more open)
  wall: Material; // block filling the solid parts
  accent?: Material; // rare block sprinkled in (blue mushroom, glowstone...)
  accentChance?: number; // noise threshold for accent blocks
};

type BiomesHolder = {
  surface: Record<string, SurfaceBiome>;
  underground: Record<string, UndergroundBiome>;
};
const biomes: BiomesHolder = {
  surface: {
    plains: {
      name: "plains",
      grass: "grass",
      earth: "earth",
      rock: "rock",

      airThreshold: 0.25,
      oreFilter: [[materials.treeOre, 1]],
      // oreFilter: (ores: Material[]) => {
      //   ores.filter((ore: Material) => ore.name !== "coalOre");
      // },
    },
    tundra: {
      name: "tundra",
      grass: "snow",
      earth: "ice",
      rock: "iron",

      airThreshold: 0.5,
      oreFilter: [
        [materials.treeOre, 0],
        [materials.ancientOre, 0],
      ],
      // oreFilter: (ores: Material[]) => {
      //   ores.filter((ore: Material) => ore.name !== "treeOre");
      // },
    },
  },
  underground: {
    cave: {
      minDepth: 1 - surfaceLevel,
      airThreshold: 0.5,
      wall: materials.rock,
      accent: materials.iron,
      accentChance: 0.3,
    },
    mushroomCave: {
      minDepth: 0.3,
      airThreshold: 0.3, // slightly more open than normal caves
      wall: materials.mushroomEarth,
      accent: materials.mushroomCap,
      accentChance: 0.65,
    },
    crystalCave: {
      minDepth: 0.6,
      airThreshold: 0.2, // tight, narrow passages
      wall: materials.rock,
      accent: materials.crystal,
      accentChance: 0.7,
    },
  },
};

const undergroundPerlinNoise = perlin(horizontalBoxes, verticalBoxes, 6, 4);
// High-frequency blend noises keep biome boundaries from being straight vertical/horizontal cuts
const surfaceBlendNoise = perlin(
  horizontalBoxes,
  1,
  worldWidth / (blockSize * 80),
  1
);
const undergroundBlendNoise = perlin(horizontalBoxes, verticalBoxes, 20, 15);
export const undergroundAccentNoise = perlin(
  horizontalBoxes,
  verticalBoxes,
  30,
  25
);

export const getUndergroundBiome = (
  relDepth: number,
  col: number,
  row: number
): UndergroundBiome => {
  const base = undergroundPerlinNoise[col][row];
  const blend = undergroundBlendNoise[col][row] * 0.25; // wiggle zone boundary by ±0.25
  const val = base + blend;

  if (val < -0.35 && relDepth > biomes.underground.crystalCave.minDepth)
    return biomes.underground.crystalCave;
  if (val > 0.35 && relDepth > biomes.underground.mushroomCave.minDepth)
    return biomes.underground.mushroomCave;
  return biomes.underground.cave;
};

export const surfaceBiomeMap = (): SurfaceBiome[] => {
  const p = perlin(horizontalBoxes, 1, worldWidth / (blockSize * 250), 1);
  return p.map(([val], col) => {
    const blend = surfaceBlendNoise[col][0] * 0.3; // wiggle boundary for smooth transition
    const biomeVal = val + blend;
    // if (biomeVal < -0.33) return biomes.surface.desert;
    if (biomeVal < 0) return biomes.surface.tundra;
    return biomes.surface.plains;
  });
};
