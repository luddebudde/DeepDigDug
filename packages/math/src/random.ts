import { vectorFromAngle } from "./angle.ts";
import { type Vec2 } from "./vec.ts";

export const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const randomUnitVector = (): Vec2 =>
  vectorFromAngle(Math.random() * 2 * Math.PI);
export type Integer = number;
