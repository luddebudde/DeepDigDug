import { perlin } from "../math/perlin";

export const boxSize = 50;

export const worldWidth = 200 * boxSize;
export const worldHeight = 100 * boxSize;
const hvRatio = 1 / 2;
export const horizontalBoxes = worldWidth / boxSize;
const verticalBoxes = worldHeight / boxSize;

export const p1 = perlin(horizontalBoxes, verticalBoxes, 6, hvRatio * 6);
export const p2 = perlin(horizontalBoxes, verticalBoxes, 8, hvRatio * 8);
export const p3 = perlin(horizontalBoxes, verticalBoxes, 16, hvRatio * 16);

export const rockness = perlin(horizontalBoxes, verticalBoxes, 2, hvRatio * 2);
export const rockEarthRatio = 0.1;

export const isWinter = Math.random() * 2 < 1;
const worldYOffset = 500;

export const p1Weight = 4;
export const p2Weight = 3;
export const p3Weight = 5;
export const pTotalWeight = p1Weight + p2Weight + p3Weight;
