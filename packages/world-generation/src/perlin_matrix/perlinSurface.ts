import { perlin } from "@repo/math";
import { horizontalBoxes} from "../perlinConstants";

export const surfaceLevel = 0.2;

const surfaceBand = 50;
export const surfaceRows = (): number[] => {
  const p1 = perlin(horizontalBoxes, 1, 40, 1);
  const p2 = perlin(horizontalBoxes, 1, 12, 1);
  const p3 = perlin(horizontalBoxes, 1, 4, 1);

  const p1Weight = 6;
  const p2Weight = 12;
  const p3Weight = 8;
  const totalWeight = p1Weight + p2Weight + p3Weight;

  const heights = p1.map(([v1], col) => {
    const combined =
      (v1 * (p1Weight / totalWeight) +
        p2[col][0] * (p2Weight / totalWeight) +
        p3[col][0] * (p3Weight / totalWeight) +
        1) /
      2;
    const min = 0.35;
    const max = 0.65;

    const normalized = (combined - min) / (max - min);

    return normalized * surfaceBand;
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
