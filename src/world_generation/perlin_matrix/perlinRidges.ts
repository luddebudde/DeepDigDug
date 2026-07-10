import { log } from "node:console";
import { addMat, mapMat, scaleMat } from "../../math/matrix";
import { createVec } from "../../math/vec";
import {
  blockSize,
  horizontalBoxes,
  p1,
  p1Weight,
  pTotalWeight,
  p2,
  p2Weight,
  p3,
  p3Weight,
  rockEarthRatio,
  rockness,
  worldHeight,
  worldWidth,
  xWorldOffset,
} from "../perlinConstants";

//const ridgesType = Math.random() < 0.5 ? "islands" : "ridges";
const ridgesType = "ridges";

export const ridges = () =>
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
          column * blockSize + xWorldOffset,
          row * blockSize
        );
        console.log("column", column, "row", row);

        return [
          ridgesType === "islands" ? Math.abs(val) : 1 - Math.abs(val),
          coord,
        ] as const;
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

      const ridgesThresHold = ridgesType === "islands" ? 0.4 : 0.2;
      const relY = pos.y / worldHeight;
      const material =
        newValue < ridgesThresHold
          ? "air"
          : (relY * relY * (rockness[row][column] + 1)) / 2 > rockEarthRatio
            ? "rock"
            : "earth";

      return [newValue, material, pos] as const;
    }
  );
