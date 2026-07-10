import RAPIER from "@dimforge/rapier2d";
import { Container, RenderTexture, Sprite, Texture } from "pixi.js";
import { Material } from "./materials";
import { Vec2 } from "../math/vec";
import { chunkRelSize, chunkSize } from "./perlinConstants";
import { gridToIdx, Integer } from "../findWorldBlocks";

export type DamagedBlock = {
  idx: number;
  materialInt: Integer;
  durability: number;
};

export type Chunk = {
  blocks: Uint8Array;
  damagedBlocks: DamagedBlock[];
  renderdChange: boolean;
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

export type Mesh = { row: number; column: number };

export const createChunk = (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  chunks: Chunk[][],
  mesh: Mesh,
  materialId: number
) => {
  const column = mesh.column;
  const row = mesh.row;

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
      blocks: new Uint8Array(chunkRelSize * chunkRelSize),
      damagedBlocks: [],
      renderdChange: false,
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
  pushBlockToChunk(mesh, chosenChunk, materialId);
};

const pushBlockToChunk = (mesh: Mesh, chunk: Chunk, materialId: number) => {
  const localColumn =
    ((mesh.column % chunkRelSize) + chunkRelSize) % chunkRelSize;
  const localRow = ((mesh.row % chunkRelSize) + chunkRelSize) % chunkRelSize;

  // if (materialId !== 0) {
  //   console.log(materialId);
  // }

  const idx = gridToIdx(localColumn, localRow);
  chunk.blocks[idx] = materialId;
};
