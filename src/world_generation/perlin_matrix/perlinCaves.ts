import { mapMat, addMat, scaleMat } from "../../math/matrix";
import { createVec } from "../../math/vec";
import {
  p1,
  p1Weight,
  pTotalWeight,
  p2,
  p2Weight,
  p3,
  p3Weight,
  boxSize,
  horizontalBoxes,
  worldHeight,
  worldWidth,
  rockness,
  rockEarthRatio,
  isWinter,
} from "../perlinConstants";

//const cavesThresHold = random(0.2, 0.4);
export const cavesThresHold = 0.25;

export const caves = () =>
  mapMat(
    mapMat(
      addMat(
        addMat(
          scaleMat(p1, p1Weight / pTotalWeight),
          scaleMat(p2, p2Weight / pTotalWeight)
        ),
        scaleMat(p3, p3Weight / pTotalWeight)
      ),
      (val, column, row) => {
        const coord = createVec(
          column * boxSize - (horizontalBoxes * boxSize) / 2,
          row * boxSize
        );

        return [(val + 1) / 2, coord] as const;
      }
    ),
    ([value, pos], row, column) => {
      const fadeBorder =
        16 *
        ((1 - pos.y / worldHeight) *
          (pos.y / worldHeight) *
          (1 - (pos.x + worldWidth / 2) / worldWidth) *
          ((pos.x + worldWidth / 2) / worldWidth));

      const newValue = fadeBorder * value;

      const relY = pos.y / worldHeight;
      const material =
        newValue < cavesThresHold
          ? "air"
          : (relY * relY * (rockness[row][column] + 1)) / 2 > rockEarthRatio
            ? isWinter
              ? "ice"
              : "rock"
            : "earth";

      return [newValue, material, pos] as const;
    }
  );
