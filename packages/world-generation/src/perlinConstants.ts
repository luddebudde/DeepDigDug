export const blockSize = 75;
// export const blockSize = 25;

export const chunkRelSize = 16;
export const chunkSize = chunkRelSize * blockSize;

// export const worldWidth = 150 * blockSize;
// export const worldHeight = 150 * blockSize;
export const worldWidth = 450 * blockSize;
export const worldHeight = 450 * blockSize;

// const worldYOffset = 500;
export const xWorldOffset = -((worldWidth / blockSize) * blockSize) / 2;

export const hvRatio = 1 / 2;
export const horizontalBoxes = worldWidth / blockSize;
export const verticalBoxes = worldHeight / blockSize;

export const cavesThresHold = 0.25;
