// perlinOres.ts

import { perlin } from "../../math/perlin";
import { Material, materials } from "../materials";
import {
  horizontalBoxes,
  verticalBoxes,
  worldHeight,
  worldWidth,
} from "../perlinConstants";
import { surfaceLevel } from "./perlinSurface";

// Small, high-frequency noise → tight blobs
export const treeOreNoise = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 500,
  worldHeight / 300
);
export const ancientOreNoise = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 1600,
  worldHeight / 300
);
export const coalNoise = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 300,
  worldHeight / 300
);
export const ironNoise = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 200,
  worldHeight / 200
);
export const diamondNoise = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 150,
  worldHeight / 150
);

type Ore = {
  material: Material;
  frequency: number;
  minHeight: number;
  maxHeight: number;
  noiseMap: number[][];
};

const treeOre: Ore = {
  material: materials.treeOre,
  frequency: 0.05,
  minHeight: 0,
  maxHeight: surfaceLevel,
  noiseMap: treeOreNoise,
};
const ancientOre: Ore = {
  material: materials.ancientTreeOre,
  frequency: 0.001,
  minHeight: 0,
  maxHeight: surfaceLevel,
  noiseMap: ancientOreNoise,
};
const coalOre: Ore = {
  material: materials.coal,
  frequency: 0.1,
  minHeight: surfaceLevel * 0.66,
  maxHeight: 0.6,
  noiseMap: coalNoise,
};
const ironOre: Ore = {
  material: materials.iron,
  frequency: 0.05,
  minHeight: surfaceLevel,
  maxHeight: 0.8,
  noiseMap: ironNoise,
};
const diamondOre: Ore = {
  material: materials.diamond,
  frequency: 0.005,
  minHeight: 0.7,
  maxHeight: 1,
  noiseMap: diamondNoise,
};

const ores: Ore[] = [coalOre, treeOre, ancientOre, ironOre, diamondOre];

export const generateOre = (
  relDepth: number,
  col: number,
  row: number,
  oreFilter: [Material, number][]
): Ore | undefined => {
  const activeOres: (Ore | undefined)[] = ores.map((ore: Ore) => {
    const matchingFilter = oreFilter.find(
      ([material]) => material === ore.material
    );
    const oreCoefficient = matchingFilter?.[1] ?? 1; // fallback to 1 if no match found

    if (
      relDepth > ore.minHeight &&
      relDepth < ore.maxHeight &&
      ore.noiseMap[col][row] > 1 - ore.frequency * oreCoefficient
    ) {
      return ore;
    }
  });

  // Reverse, so rarer ore is prioritesed
  const thisOre: Ore | undefined = activeOres
    .reverse()
    .find((a: Ore | undefined) => a !== undefined);

  return thisOre;
};
