import { Chunk } from "./createChunk";
import { Object } from "./main";
import { Vec2 } from "./math/vec";
import { blockSize, chunkSize } from "./world_generation/perlinConstants";

// Add safety measures, in case the selected "column" and "row" is undefined
export const getWorldPos = (
  pos: Vec2
): [columnIndex: number, rowIndex: number] => {
  const columnIndex = Math.floor(pos.x / (blockSize * chunkSize));
  const rowIndex = Math.floor(pos.y / (blockSize * chunkSize));

  return [columnIndex, rowIndex];
};

// Add safety measures, in case the selected "column" and "row" is undefined
export const findChunk = (pos: Vec2, chunks: Chunk[][]): Chunk => {
  const [columnIndex, rowIndex] = getWorldPos(pos);
  const foundChunk = chunks[columnIndex][rowIndex];

  if (!foundChunk) throw "error: couldn't find chunk";

  return chunks[columnIndex][rowIndex];
};

export const calculateBlockCollision = (
  movingUnit: Object,
  chunks: Chunk[][]
) => {
  const currentPos = movingUnit.body.translation();
  const currentVel = movingUnit.body.linvel();

  const selectedChunk = findChunk;

  movingUnit.body.setLinvel({ x: 0, y: 0 }, true);
};
