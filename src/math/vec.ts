export type Vec2 = {
  x: number;
  y: number;
};

export const origo = {
  x: 0,
  y: 0,
};

export const add = (num1: Vec2, num2: Vec2): Vec2 => {
  return { x: num1.x + num2.x, y: num1.y + num2.y };
};

export const addVar = (num1: Vec2, num2: number): Vec2 => {
  return { x: num1.x + num2, y: num1.y + num2 };
};

export const sub = (num1: Vec2, num2: Vec2): Vec2 => {
  return { x: num1.x - num2.x, y: num1.y - num2.y };
};

export const subVar = (num1: Vec2, num2: number): Vec2 => {
  return { x: num1.x - num2, y: num1.y - num2 };
};

export const div = (num1: Vec2, num2: Vec2): Vec2 => {
  return { x: num1.x / num2.x, y: num1.y / num2.y };
};

export const divVar = (num1: Vec2, num2: number): Vec2 => {
  return { x: num1.x / num2, y: num1.y / num2 };
};

export const revDivVar = (num1: number, num2: Vec2): Vec2 => {
  return { x: num1 / num2.x, y: num1 / num2.y };
};

export const mult = (num1: Vec2, num2: Vec2): Vec2 => {
  return { x: num1.x * num2.x, y: num1.y * num2.y };
};

export const multVar = (num1: Vec2, num2: number): Vec2 => {
  return { x: num1.x * num2, y: num1.y * num2 };
};

export const sqrtVec = (num1: Vec2) => ({
  x: Math.sqrt(Math.abs(num1.x)),
  y: Math.sqrt(Math.abs(num1.y)),
});

export const lengthVec = (vec: Vec2): number => {
  return Math.hypot(vec.x, vec.y);
};

export const rotateVec90 = (vec: Vec2): Vec2 => ({
  x: -vec.y,
  y: vec.x,
});

export const dot = (num1: Vec2, num2: Vec2) => {
  return num1.x * num2.x + num1.y * num2.y;
};

export const normalise = (vec: Vec2): Vec2 => {
  const length = lengthVec(vec);
  if (length === 0) {
    return { x: 1, y: 0 };
  }
  return {
    x: vec.x / length,
    y: vec.y / length,
  };
};

export const maxVar = (num1: Vec2, max: number): Vec2 => {
  return { x: Math.max(num1.x, max), y: Math.max(num1.y, max) };
};

export const minVar = (num1: Vec2, min: number): Vec2 => {
  return { x: Math.min(num1.x, min), y: Math.min(num1.y, min) };
};

export const createVec = (x: number, y: number): Vec2 => {
  const vec = { x, y };
  return vec;
};

export const cubify = (value: number): Vec2 => {
  return { x: value, y: value };
};
