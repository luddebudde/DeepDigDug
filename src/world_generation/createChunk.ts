import RAPIER from "@dimforge/rapier2d";
import { Container, RenderTexture, Sprite, Texture } from "pixi.js";
import { Material } from "./materials";
import { Vec2 } from "../math/vec";
import { chunkRelSize, chunkSize } from "./perlinConstants";
import { getIndexFromGrid } from "../findWorldBlocks";

export type Block = {
  material: Material;
  pos: Vec2;
  column: number;
  row: number;
  materialKey: string;
  collider: RAPIER.Collider | undefined;
};

export type Chunk = {
  blocks: Block[];
  column: number;
  row: number;
  renderTexture?: RenderTexture;
  sprite?: Sprite;
  dirty: boolean;
  rapier: {
    desc: RAPIER.RigidBodyDesc;
    body?: RAPIER.RigidBody;
  };
};

// WILL CRASH IF SPACE BETWEEN TWO CHUNKS IS A WHOLE EMPTY CHUNK
export const createChunk = (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  chunks: Chunk[][],
  block: Block
) => {
  const column = block.column;
  const row = block.row;

  // X-pos
  const columnIndex = Math.floor(column / chunkRelSize);
  // Y-pos
  const rowIndex = Math.floor(row / chunkRelSize);

  // const blocks = [// Column 1 [// Row 1, // Row 2], // Column 2 [// Row 1, // Row 2], // Column 3[]]

  if (chunks[columnIndex] === undefined) {
    chunks[columnIndex] = [];
  }

  if (chunks[columnIndex][rowIndex] === undefined) {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed();
    bodyDesc.setTranslation(
      columnIndex * chunkSize + chunkSize / 2,
      rowIndex * chunkSize + chunkSize / 2
    );
    chunks[columnIndex][rowIndex] = {
      blocks: new Array<Block>(chunkRelSize * chunkRelSize),
      column: columnIndex,
      row: rowIndex,
      renderTexture: undefined,
      sprite: undefined,
      dirty: false,
      rapier: {
        desc: bodyDesc,
        body: undefined,
      },
    };
  }
  const chosenChunk = chunks[columnIndex][rowIndex];
  pushBlockToChunk(block, chosenChunk);
};

const pushBlockToChunk = (block: Block, chunk: Chunk) => {
  const localColumn =
    ((block.column % chunkRelSize) + chunkRelSize) % chunkRelSize;
  const localRow = ((block.row % chunkRelSize) + chunkRelSize) % chunkRelSize;

  const idx = getIndexFromGrid(localColumn, localRow);
  chunk.blocks[idx] = block;
};
