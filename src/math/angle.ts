import { Vec2 } from "./vec";

export const angle = (vec: Vec2) => Math.atan2(vec.y, vec.x);
export const vectorFromAngle = (angle: number): Vec2 => {
  const vec = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  return vec;
};
export const degrees = (radians: number): number => (radians * 180) / Math.PI;
export const radians = (degrees: number): number => (degrees * Math.PI) / 180;
