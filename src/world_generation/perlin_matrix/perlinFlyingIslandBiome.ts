// import { addMat, mapMat, scaleMat } from "../../math/matrix";
// import { createVec } from "../../math/vec";
// import {
//   blockSize,
//   worldHeight,
//   worldWidth,
//   xWorldOffset,
// } from "../perlinConstants";
// import { perlin } from "../../math/perlin";

// const hvRatio = 1 / 2;
// const horizontalBoxes = worldWidth / blockSize;
// const verticalBoxes = worldHeight / blockSize;

// const pScale = 700;

// const p1 = perlin(
//   horizontalBoxes,
//   verticalBoxes,
//   worldWidth / 1875,
//   worldHeight / hvRatio / (pScale * 5)
// );
// const p2 = perlin(
//   horizontalBoxes,
//   verticalBoxes,
//   worldWidth / 1406,
//   worldHeight / hvRatio / (pScale * 4)
// );
// const p3 = perlin(
//   horizontalBoxes,
//   verticalBoxes,
//   worldWidth / 703,
//   worldHeight / hvRatio / (pScale * 2)
// );

// const p1Weight = 30;
// const p2Weight = 30;
// const p3Weight = 15;
// const pTotalWeight = p1Weight + p2Weight + p3Weight;

// const rockness = perlin(horizontalBoxes, verticalBoxes, 2, hvRatio * 2);
// const rockEarthRatio = 0.05;

// export const flyingIslandBiome = () =>
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
//       const material =
//         newValue < airThesHold
//           ? "air"
//           : (relY * relY * (rockness[row][column] + 1)) / 2 > rockEarthRatio
//             ? "rock"
//             : "earth";

//       return [newValue, material, pos] as const;
//     }
//   );
