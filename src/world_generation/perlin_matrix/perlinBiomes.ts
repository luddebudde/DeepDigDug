import { perlin } from "../../math/perlin";
import { blockSize, horizontalBoxes, worldWidth } from "../perlinConstants";

// perlinBiomes.ts
export type Biome = "plains" | "tundra";

export const biomeMap = (): Biome[] => {
  const p = perlin(horizontalBoxes, 1, worldWidth / (blockSize * 500), 1);
  return p.map(([val]) => {
    // if (val < -0.33) return "desert";
    if (val < 0.15) return "plains";
    return "tundra";
  });
};
