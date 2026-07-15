import { zeros2 } from "./zeroes.js";
import { randomUnitVector } from "./random.js";
import { mapMat } from "./matrix.js";
import { createVec, dot, normalise } from "./vec.js";

export const perlin = (
  width: number,
  height: number,
  gridColumns: number,
  gridRows: number
) => {
  const gridWidth = Math.ceil(width / gridColumns);
  const gridHeight = Math.ceil(height / gridRows);
  const gradients = mapMat(
    zeros2(Math.ceil(gridColumns + 1), Math.ceil(gridRows + 1)),
    randomUnitVector
    // randomVectorOf4,
  );
  const step2 = mapMat(zeros2(width, height), (_, x, y) => {
    const gridLeftColumn = Math.floor(x / gridWidth);
    const gridRightColum = gridLeftColumn + 1;
    const gridTopRow = Math.floor(y / gridHeight);
    const gridBottomRow = gridTopRow + 1;

    const gradientTopLeft = gradients[gridLeftColumn][gridTopRow];
    const gradientTopRight = gradients[gridRightColum][gridTopRow];
    const gradientBottomLeft = gradients[gridLeftColumn][gridBottomRow];
    const gradientBottomRight = gradients[gridRightColum][gridBottomRow];

    // Coordinates relative to the square top-left corner; a value between 0 and 1
    const xf = x / gridWidth - gridLeftColumn;
    const yf = y / gridHeight - gridTopRow;
    // const n = normalise;
    // const n = (it) => it
    const dirTopLeft = createVec(xf, yf);
    const dirTopRight = createVec(xf - 1, yf);
    const dirBottomLeft = createVec(xf, yf - 1);
    const dirBottomRight = createVec(xf - 1, yf - 1);

    const dotTopLeft = dot(gradientTopLeft, dirTopLeft);
    const dotTopRight = dot(gradientTopRight, dirTopRight);
    const dotBottomLeft = dot(gradientBottomLeft, dirBottomLeft);
    const dotBottomRight = dot(gradientBottomRight, dirBottomRight);

    const u = fade(xf);
    const v = fade(yf);
    // Fade interpolation
    return linearInterpolation(
      u,
      linearInterpolation(v, dotTopLeft, dotBottomLeft),
      linearInterpolation(v, dotTopRight, dotBottomRight)
    );
  });

  return step2;
};
const linearInterpolation = (t: number, a1: number, a2: number): number =>
  a1 + t * (a2 - a1);

/**
 * Smooth step between 0 and 1
 * @param t a value between 0 and 1
 */
const fade = (t: number): number => ((6 * t - 15) * t + 10) * t * t * t;

export const normalizeNoise = (
  val: number,
  expectedMin: number = -0.7,
  expectedMax: number = 0.7
): number => {
  // const expectedMin = -0.7;
  // const expectedMax = 0.7;
  // Map -0.7...0.7 strictly to 0...1
  const normalized = (val - expectedMin) / (expectedMax - expectedMin);
  return Math.max(0, Math.min(1, normalized)); // Clamp
};

// "If noiseValue is larger than threshold, then true "
export const perlinThreshold = (
  noiseValue: number,
  threshold: number,
  expectedMin: number = -0.7,
  expectedMax: number = 0.7
) => {
  const normValue = normalizeNoise(noiseValue, expectedMin, expectedMax);
  const linearized = linearizeNoise(normValue);

  return linearized > threshold;
};

/**
 * Flattens the Perlin bell curve so that threshold steps
 * map much more linearly to actual space/percentages.
 */
export const linearizeNoise = (val: number): number => {
  // A standard smoothstep curve redistributes the tight middle cluster
  // out toward the edges, flattening the bell-curve rate of change.
  return val * val * (3 - 2 * val);
};
