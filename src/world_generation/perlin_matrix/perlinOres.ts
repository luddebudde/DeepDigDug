// perlinOres.ts

import { perlin } from "../../math/perlin";
import {
  horizontalBoxes,
  verticalBoxes,
  worldHeight,
  worldWidth,
} from "../perlinConstants";

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
