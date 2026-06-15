import { perlin } from "../math/perlin";

export const blockSize = 75;
export const chunkRelSize = 32;
export const chunkSize = chunkRelSize * blockSize;

export const worldWidth = 150 * blockSize;
export const worldHeight = 150 * blockSize;
// export const worldWidth = 300 * blockSize;
// export const worldHeight = 300 * blockSize;
const hvRatio = 1 / 2;
export const horizontalBoxes = worldWidth / blockSize;
const verticalBoxes = worldHeight / blockSize;

export const p1 = perlin(horizontalBoxes, verticalBoxes, 6, hvRatio * 6);
export const p2 = perlin(horizontalBoxes, verticalBoxes, 8, hvRatio * 8);
export const p3 = perlin(horizontalBoxes, verticalBoxes, 16, hvRatio * 16);

export const rockness = perlin(horizontalBoxes, verticalBoxes, 2, hvRatio * 2);
export const rockEarthRatio = 0.05;

export const isWinter = Math.random() * 2 < 1;
const worldYOffset = 500;

export const p1Weight = 30;
export const p2Weight = 30;
export const p3Weight = 15;
export const pTotalWeight = p1Weight + p2Weight + p3Weight;

export const xWorldOffset = -(horizontalBoxes * blockSize) / 2;
