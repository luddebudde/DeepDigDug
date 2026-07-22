#!/usr/bin/env node
import { perlin } from "@repo/math";
import { CanvasRenderingContext2D, createCanvas } from "canvas";
import { writeFile } from "node:fs/promises";

const dim = {
  width: 1024,
  height: 1024,
};

const perlinMap = perlin(dim.width, dim.height, 10, 10);
const drawMat = (ctx: CanvasRenderingContext2D, mat: number[][]) => {
  for (let columnIndex = 0; columnIndex < mat.length; columnIndex++) {
    const column = mat[columnIndex];
    for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
      const value = column[rowIndex];
      // Blue rectangle
      const a = Math.floor(value * 256);
      ctx.fillStyle = `rgb(${a}, ${a}, ${a})`;
      ctx.fillRect(rowIndex, columnIndex, 1, 1);
    }
  }
};

const canvas = createCanvas(dim.width, dim.height);
const ctx = canvas.getContext("2d");

// WRITING
// White background
ctx.fillStyle = "white";
ctx.fillRect(0, 0, dim.width, dim.height);

drawMat(ctx, perlinMap);

const buffer = canvas.toBuffer("image/png");
const filePath = process.argv[2] ?? "world";

console.log("filePath:", filePath);

await writeFile(`${filePath}.png`, buffer);

console.log("Running mapToImage...");
