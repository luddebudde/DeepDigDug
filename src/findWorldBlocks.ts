import { Block, Chunk } from "./world_generation/createChunk";
import { Vec2 } from "./math/vec";
import { zeros2 } from "./math/zeroes";
import {
  blockSize,
  chunkRelSize as relChunkSize,
  chunkSize,
  xWorldOffset,
  chunkRelSize,
} from "./world_generation/perlinConstants";

// Add safety measures, in case the selected "column" and "row" is undefined
export const getWorldGrid = (
  pos: Vec2
): [blockColumnIndex: number, blockRowIndex: number] => {
  const blockColumnIndex = Math.floor((pos.x - xWorldOffset) / blockSize);
  const blockRowIndex = Math.floor(pos.y / blockSize);

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

// export const findBorderingBlocks = (
//   pos: Vec2,
//   chunks: Chunk[][],
//   range: number
// ) => {
//   const gridSize = range * 2 + 1;
//   return zeros2(gridSize, gridSize).map((block, idx) => {
//     const [row, column] = idxToGrid(idx);
//     return findBlock(
//       {
//         x: pos.x + (column - range) * blockSize,
//         y: pos.y + (row - range) * blockSize,
//       },
//       chunks
//     );
//   });
// };

export const getIndexFromGrid = (column: number, row: number): number => {
  return row * chunkRelSize + column;
};

export const idxToGrid = (index: number): [row: number, column: number] => {
  const row = Math.floor(index / chunkRelSize);
  const col = index % chunkRelSize;

  return [row, col];
};
