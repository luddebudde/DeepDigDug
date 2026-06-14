import RAPIER from "@dimforge/rapier2d";
import { Container } from "pixi.js";
import { Material } from "./world_generation/materials";
import { Vec2 } from "./math/vec";
import {
  blockSize,
  worldHeight,
  worldWidth,
  xWorldOffset,
} from "./world_generation/perlinConstants";
import { zeros2 } from "./math/zeroes";
import { log } from "node:console";
import { createSprite } from "./pixi/createSprite";

export type Block = {
  material: Material;
  pos: Vec2;
  column: number;
  row: number;
};

const newArray = () => [];

export const createChunk = (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  chunks: Block[][],
  block: Block
) => {
  const column = block.column;
  const row = block.row;

  // X-pos
  const columnIndex = Math.floor(column / 32);
  // Y-pos
  const rowIndex = Math.floor(row / 32);

  // const blocks = [// Column 1 [// Row 1, // Row 2], // Column 2 [// Row 1, // Row 2], // Column 3[]]

  if (chunks[columnIndex] === undefined) {
    chunks[columnIndex] = [];
  }

  if (chunks[columnIndex][rowIndex] === undefined) {
    chunks[columnIndex][rowIndex] = [];
  }
  chunks[columnIndex][rowIndex].push(block);
};
