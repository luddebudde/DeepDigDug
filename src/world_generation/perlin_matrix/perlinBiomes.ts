import {
  normalizeNoise,
  perfectUniformDistribution,
  perlin,
  perlinThreshold,
} from "../../math/perlin";
import { random } from "../../math/random";
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
  frequencyWeight: number;

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
      frequencyWeight: 2,

      grass: "grass",
      earth: "earth",
      rock: "rock",

      airThreshold: 0.4,
      oreFilter: [[materials.treeOre, 1]],
      // oreFilter: (ores: Material[]) => {
      //   ores.filter((ore: Material) => ore.name !== "coalOre");
      // },
    },
    tundra: {
      name: "tundra",
      frequencyWeight: 1,

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
    desert: {
      name: "desert",
      frequencyWeight: 0,

      grass: "diamond",
      earth: "rock",
      rock: "treeOre",

      airThreshold: 0.1,
      oreFilter: [],
      // oreFilter: (ores: Material[]) => {
      //   ores.filter((ore: Material) => ore.name !== "coalOre");
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
      airThreshold: 0.4,
      wall: materials.mushroomEarth,
      accent: materials.mushroomOre,
      accentChance: 0.5,
    },
    crystalCave: {
      minDepth: 0.6,
      airThreshold: 0.3,
      wall: materials.obsidian,
      accent: materials.amethyst,
      accentChance: 0.25,
    },
  },
};

const undergroundPerlinNoise = perlin(horizontalBoxes, verticalBoxes, 2, 4);
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
  const baseNoise = undergroundPerlinNoise[col][row];
  const boundaryWiggle = undergroundBlendNoise[col][row] * 0.12; // Lower amplitude is safer

  // Apply the wiggle directly inside the threshold evaluation
  const adjustedDepth = relDepth + boundaryWiggle;

  if (
    baseNoise > 0.3 &&
    adjustedDepth > biomes.underground.crystalCave.minDepth
  ) {
    return biomes.underground.crystalCave;
  }
  if (
    baseNoise < -0.3 &&
    adjustedDepth > biomes.underground.mushroomCave.minDepth
  ) {
    return biomes.underground.mushroomCave;
  }
  return biomes.underground.cave;
};

const entries: [string, SurfaceBiome][] = Object.entries(biomes.surface);
const totalWeight: number = entries.reduce(
  (prevVal: number, [_, biome], i: number): number => {
    return (prevVal += biome.frequencyWeight);
  },
  0
);
const biomeFreqWeight: [string, number][] = entries.map(([key, biome]) => {
  return [key, biome.frequencyWeight / totalWeight];
});

export const surfaceBiomeMap = (): [SurfaceBiome, number, SurfaceBiome][] => {
  const p = perlin(horizontalBoxes, 1, worldWidth / (blockSize * 250), 1);
  return p.map(([val], col) => {
    const blend = surfaceBlendNoise[col][0] * 0.3;
    const biomeVal = val + blend;
    const normVal = perfectUniformDistribution(biomeVal);

    let totalThreshold: number = 0;

    for (let i = 0; i < entries.length; i++) {
      const [key, frequency] = biomeFreqWeight[i];
      totalThreshold += frequency;

      if (normVal <= totalThreshold) {
        const nextIndex = (i + 1) % entries.length;
        const secondaryBiome = biomes.surface[entries[nextIndex][0]];

        // Distance from this point to the upper edge of the current biome's range.
        const distanceToEdge = totalThreshold - normVal;

        // Full strength while comfortably inside the biome, fading linearly
        // to 0 as normVal approaches the border with the next biome.
        const biomeShiftMargin = 0.05;
        const biomeStrength =
          distanceToEdge >= biomeShiftMargin
            ? 1
            : Math.max(0, distanceToEdge / biomeShiftMargin);

        return [biomes.surface[key], biomeStrength, secondaryBiome];
      }
    }

    console.log("Could not find biome: resorted to plains/desert instead");

    return [biomes.surface.desert, 0.5, biomes.surface.plains];
  });
};
