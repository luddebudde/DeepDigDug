import { Chunk } from "./world_generation/createChunk";
import { origo, Vec2 } from "./math/vec";
import { zeros2 } from "./math/zeroes";
import {
  blockSize,
  chunkRelSize as relChunkSize,
  chunkSize,
  xWorldOffset,
  chunkRelSize,
} from "./world_generation/perlinConstants";
import { getMaterial, getMaterialId } from "./world_generation/materials";

export type Integer = number;

// Add safety measures, in case the selected "column" and "row" is undefined
export const getWorldGrid = (
  pos: Vec2
): [blockColumnIndex: number, blockRowIndex: number] => {
  const blockWidth = blockSize / 2;
  const blockColumnIndex = Math.floor(
    (pos.x + blockWidth - xWorldOffset) / blockSize
  );
  const blockRowIndex = Math.floor((pos.y + blockWidth) / blockSize);

  return [blockColumnIndex, blockRowIndex];
};

// Add safety measures, in case the selected "column" and "row" is undefined
export const findChunk = (pos: Vec2, chunks: Chunk[][]): Chunk | undefined => {
  const [blockColumnIndex, blockRowIndex] = getWorldGrid(pos);

  const column = Math.floor(blockColumnIndex / relChunkSize);
  const row = Math.floor(blockRowIndex / relChunkSize);

  if (chunks[column]?.[row] === undefined) return;

  const foundChunk = chunks[column][row];

  if (foundChunk === undefined) return;
  if (!foundChunk) throw "error: couldn't find chunk";

  return foundChunk;
};

export const findBlock = (
  pos: Vec2,
  chunk: Chunk
): [idx: number, materialInt: Integer] => {
  // Universal grid
  const [universalColumn, universalRow] = getWorldGrid(pos);

  // Relative grid
  const relColumn = universalColumn % chunkRelSize;
  const relRow = universalRow % chunkRelSize;

  const idx = gridToIdx(relColumn, relRow);

  return [idx, chunk.blocks[idx]];
};

// export const findBlock = (pos: Vec2, chunks: Chunk[][]): Block | undefined => {
//   const activeChunk: Chunk | undefined = findChunk(pos, chunks);
//   const [worldColumnIndex, worldRowIndex] = getWorldGrid(pos);

//   const localColumn =
//     ((worldColumnIndex % relChunkSize) + relChunkSize) % relChunkSize;
//   const localRow =
//     ((worldRowIndex % relChunkSize) + relChunkSize) % relChunkSize;

//   if (activeChunk === undefined) return;

//   const foundBlock =
//     activeChunk.blocks[getIndexFromGrid(localColumn, localRow)];

//   return foundBlock;
// };

export const findBorderingChunks = (
  pos: Vec2,
  chunks: Chunk[][],
  range: number
): (Chunk | undefined)[][] => {
  const gridSize = range * 2 + 1;

  return zeros2(gridSize, gridSize).map((column, columnIndex) =>
    column.map((row, rowIndex) =>
      findChunk(
        {
          x: pos.x + (columnIndex - range) * chunkSize,
          y: pos.y + (rowIndex - range) * chunkSize,
        },
        chunks
      )
    )
  );
};

// Remake to use idx instead of whatever this bullshit is
export const findBorderingBlocks = (
  pos: Vec2,
  chunks: Chunk[][],
  range: number
): ([idx: number, materialInt: Integer] | undefined)[][] => {
  const gridSize = range * 2 + 1;

  return zeros2(gridSize, gridSize).map((column, columnIndex) =>
    column.map((_, rowIndex) => {
      const offsetPos: Vec2 = {
        x: pos.x + (columnIndex - range) * blockSize,
        y: pos.y + (rowIndex - range) * blockSize,
      };
      const chunk = findChunk(offsetPos, chunks);
      if (!chunk) return undefined;
      return findBlock(offsetPos, chunk);
    })
  );
};

export const gridToIdx = (column: number, row: number): number => {
  // WANTS INFORMATION WITHIN THE CHUNK
  return row * chunkRelSize + column;
};

export const idxToGrid = (index: number): [row: number, column: number] => {
  // WANTS BLOCK'S INDEX IN THE CHUNK
  const row = Math.floor(index / chunkRelSize);
  const col = index % chunkRelSize;

  return [row, col];
};

export const changeBlock = (
  blocks: Uint8Array,
  targetIdx: number,
  material: string
) => {
  blocks[targetIdx] = getMaterialId(material);
};
