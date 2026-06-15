import { Block, Chunk } from "./world_generation/createChunk";
import { Vec2 } from "./math/vec";
import { zeros2 } from "./math/zeroes";
import {
  blockSize,
  chunkRelSize as relChunkSize,
  chunkSize,
  xWorldOffset,
} from "./world_generation/perlinConstants";

// Add safety measures, in case the selected "column" and "row" is undefined
export const getWorldIndex = (
  pos: Vec2
): [blockColumnIndex: number, blockRowIndex: number] | undefined => {
  const blockColumnIndex = Math.floor((pos.x - xWorldOffset) / blockSize);
  const blockRowIndex = Math.floor(pos.y / blockSize);

  return [blockColumnIndex, blockRowIndex];
};

// Add safety measures, in case the selected "column" and "row" is undefined
export const findChunk = (pos: Vec2, chunks: Chunk[][]): Chunk | undefined => {
  const [blockColumnIndex, blockRowIndex] = getWorldIndex(pos);

  const column = Math.floor(blockColumnIndex / relChunkSize);
  const row = Math.floor(blockRowIndex / relChunkSize);
  //console.log(blockColumnIndex, blockRowIndex);
  console.log(column, row);

  if (chunks[column][row] === undefined) return;

  const foundChunk = chunks[column][row];

  if (foundChunk === undefined) return;
  if (!foundChunk) throw "error: couldn't find chunk";

  return foundChunk;
};

export const findBlock = (pos: Vec2, chunks: Chunk[][]): Block => {
  const activeChunk: Chunk = findChunk(pos, chunks);
  const [worldColumnIndex, worldRowIndex] = getWorldIndex(pos);

  const localColumn =
    ((worldColumnIndex % relChunkSize) + relChunkSize) % relChunkSize;
  const localRow =
    ((worldRowIndex % relChunkSize) + relChunkSize) % relChunkSize;

  if (activeChunk === undefined) return;

  const foundBlock = activeChunk.blocks[localColumn][localRow];

  return foundBlock;
};

export const findBorderingChunks = (
  pos: Vec2,
  chunks: Chunk[][],
  range: number
): Chunk[][] => {
  const gridSize = range * 2 + 1;

  zeros2(gridSize, gridSize).map((column, columnIndex) =>
    column.map((row, rowIndex) =>
      findChunk(
        {
          x: pos.x + chunkSize * columnIndex - columnIndex,
          y: pos.y + chunkSize * rowIndex - rowIndex,
        },
        chunks
      )
    )
  );
};

export const findBorderingBlocks = (
  pos: Vec2,
  chunks: Chunk[][],
  range: number
) => {
  const gridSize = range * 2 + 1;
  return zeros2(gridSize, gridSize).map((column, columnIndex) =>
    column.map((row, rowIndex) =>
      findBlock(
        {
          x: pos.x + blockSize * columnIndex - columnIndex,
          y: pos.y + blockSize * rowIndex - rowIndex,
        },
        chunks
      )
    )
  );
};
