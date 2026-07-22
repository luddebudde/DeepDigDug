import {
  linearizeNoise,
  normalizeNoise,
  perlin,
  mapMat,
  addMat,
  scaleMat,
} from "@repo/math";
import {
  blockSize,
  worldHeight,
  worldWidth,
  horizontalBoxes,
  verticalBoxes,
  xWorldOffset,
} from "../perlinConstants";

const hvRatio = 1 / 2;

const p1 = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 1875,
  worldHeight / hvRatio / 3750
);
const p2 = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 1406,
  worldHeight / hvRatio / 2800
);
const p3 = perlin(
  horizontalBoxes,
  verticalBoxes,
  worldWidth / 703,
  worldHeight / hvRatio / 1400
);

const p1Weight = 30;
const p2Weight = 30;
const p3Weight = 15;
const pTotalWeight = p1Weight + p2Weight + p3Weight;

// Returns a number[][] where each value is the cave density (0..1).
// Low values = cave/air. Threshold is applied in generateWorld.
export const caves = (): number[][] => {
  const blended = addMat(
    addMat(
      scaleMat(p1, p1Weight / pTotalWeight),
      scaleMat(p2, p2Weight / pTotalWeight)
    ),
    scaleMat(p3, p3Weight / pTotalWeight)
  );

  return mapMat(blended, (val, column, row) => {
    const normalised = normalizeNoise(val);
    const linearized = linearizeNoise(normalised);
    const x = column * blockSize + xWorldOffset;
    const y = row * blockSize;

    // const sideFade =
    //   (1 - (x + worldWidth / 2) / worldWidth) *
    //   ((x + worldWidth / 2) / worldWidth) *
    //   4;
    // const bottomFade = Math.min(1, (worldHeight - y) / (worldHeight * 0.1));
    // const fadeBorder = sideFade * bottomFade;
    const fadeBorder = 1;
    return fadeBorder * linearized;
  });
};

// --- OLD caves() that assigned materials directly ---
// const rockness = perlin(horizontalBoxes, verticalBoxes, 2, hvRatio * 2);
// const rockEarthRatio = 0.05;
// const cavesThresHold = 0.25;
// export const cavesOld = () =>
//   mapMat(
//     mapMat(blended, (val, column, row) => {
//       const coord = createVec(column * blockSize + xWorldOffset, row * blockSize);
//       return [(val + 1) / 2, coord] as const;
//     }),
//     ([value, pos], row, column) => {
//       const fadeBorder = 16 * ((1 - pos.y / worldHeight) * (pos.y / worldHeight) *
//         (1 - (pos.x + worldWidth / 2) / worldWidth) * ((pos.x + worldWidth / 2) / worldWidth));
//       const newValue = fadeBorder * value;
//       const relY = pos.y / worldHeight;
//       const material = newValue < cavesThresHold ? "air"
//         : (relY * relY * (rockness[row][column] + 1)) / 2 > rockEarthRatio ? "rock" : "earth";
//       return [newValue, material, pos] as const;
//     }
//   );
