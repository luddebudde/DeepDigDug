import RAPIER from "@dimforge/rapier2d";
import { Container, RenderTexture } from "pixi.js";
import { Material } from "./world_generation/materials";
import { Vec2 } from "./math/vec";
import {
  chunkSize,
} from "./world_generation/perlinConstants";

export type Block = {
  material: Material;
  pos: Vec2;
  column: number;
  row: number;
};

export type Chunk = {
  blocks: Block[];
  column: number;
  row: number;
  renderTexture: RenderTexture;
  dirty: boolean;
};

export const createChunk = (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  chunks: Chunk[][],
  block: Block
) => {
  const column = block.column;
  const row = block.row;

  // X-pos
  const columnIndex = Math.floor(column / chunkSize);
  // Y-pos
  const rowIndex = Math.floor(row / chunkSize);

  // const blocks = [// Column 1 [// Row 1, // Row 2], // Column 2 [// Row 1, // Row 2], // Column 3[]]

  if (chunks[columnIndex] === undefined) {
    chunks[columnIndex] = [];
  }

  if (chunks[columnIndex][rowIndex] === undefined) {
    chunks[columnIndex][rowIndex] = {
      blocks: [] as Block[],
      column: columnIndex,
      row: rowIndex,
      renderTexture: "" as RenderTexture,
      dirty: false,
    };
  }
  chunks[columnIndex][rowIndex].blocks.push(block);
};
