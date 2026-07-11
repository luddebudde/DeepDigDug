import { perlin } from "../../math/perlin";
import { horizontalBoxes, verticalBoxes, worldWidth } from "../perlinConstants";

// --- OLD multi-octave surface variables (used by the commented-out surface()) ---
// const p1 = perlin(horizontalBoxes, 1, worldWidth / 1875, 1);
// const p2 = perlin(horizontalBoxes, 1, worldWidth / 1406, 1);
// const p3 = perlin(horizontalBoxes, 1, worldWidth / 703, 1);
// const p1Weight = 30; const p2Weight = 30; const p3Weight = 15;
// const pTotalWeight = p1Weight + p2Weight + p3Weight;
// const rockness = perlin(horizontalBoxes, 1, 2, 1);
// const rockEarthRatio = 0.05;

// export const surface = () =>
//   mapMat(
//     mapMat(
//       addMat(
//         addMat(
//           scaleMat(p1, p1Weight / pTotalWeight),
//           scaleMat(p2, p2Weight / pTotalWeight)
//         ),
//         scaleMat(p3, p3Weight / pTotalWeight)
//       ),
//       (val, column, row) => {
//         const coord = createVec(
//           column * blockSize + xWorldOffset,
//           row * blockSize
//         );

//         return [Math.abs(val), coord] as const;
//       }
//     ),
//     ([value, pos], row, column) => {
//       const fadeBorder =
//         16 *
//         ((1 - pos.y / worldHeight) *
//           (pos.y / worldHeight) *
//           (1 - (pos.x + worldWidth / 2) / worldWidth) *
//           ((pos.x + worldWidth / 2) / worldWidth));

//       const newValue = fadeBorder * value;

//       const airThesHold = 0.4;
//       const relY = pos.y / worldHeight;
//       const surfaceHeight = baseHeight + value * relY
//       const material =
//         newValue < airThesHold
//           ? "air"
//           : (relY * relY * (rockness[row][column] + 1)) / 2 > rockEarthRatio
//             ? "rock"
//             : "earth";

//       return [newValue, material, pos] as const;
//     }
//   );

// perlinSurface.ts
export const surfaceLevel = 0.15;
const surfaceBand = verticalBoxes * surfaceLevel;
export const surfaceRows = (): number[] => {
  const p1 = perlin(horizontalBoxes, 1, 4, 1);
  const p2 = perlin(horizontalBoxes, 1, 12, 1);
  const p3 = perlin(horizontalBoxes, 1, 40, 1);

  const heights = p1.map(([v1], col) => {
    const combined = (v1 * 0.6 + p2[col][0] * 0.3 + p3[col][0] * 0.1 + 1) / 2;

    return combined * surfaceBand;
  });

  const smoothed = [...heights];

  const radius = 6;

  for (let i = 0; i < heights.length; i++) {
    let sum = 0;
    let count = 0;

    for (
      let j = Math.max(0, i - radius);
      j <= Math.min(heights.length - 1, i + radius);
      j++
    ) {
      sum += heights[j];
      count++;
    }

    smoothed[i] = sum / count;
  }

  return smoothed.map(Math.floor);
};
