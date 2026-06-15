import { ColliderDesc } from "@dimforge/rapier2d";
import { Chunk } from "./createChunk";
import { Object } from "./main";
import { add, addVar, multVar, Vec2 } from "./math/vec";
import {
  blockSize,
  chunkSize,
  xWorldOffset,
} from "./world_generation/perlinConstants";

// Add safety measures, in case the selected "column" and "row" is undefined
export const getWorldIndex = (
  pos: Vec2
): [blockColumnIndex: number, blockRowIndex: number] => {
  const blockColumnIndex = Math.floor((pos.x - xWorldOffset) / blockSize);
  const blockRowIndex = Math.floor(pos.y / blockSize);

  return [blockColumnIndex, blockRowIndex];
};

// Add safety measures, in case the selected "column" and "row" is undefined
export const findChunk = (pos: Vec2, chunks: Chunk[][]): Chunk => {
  const [blockColumnIndex, blockRowIndex] = getWorldIndex(pos);
  //console.log(blockColumnIndex, blockRowIndex);

  const foundChunk =
    chunks[Math.floor(blockColumnIndex / chunkSize)][
      Math.floor(blockRowIndex / chunkSize)
    ];

  if (!foundChunk) throw "error: couldn't find chunk";

  return foundChunk;
};

export const findBlock = (pos: Vec2, chunks: Chunk[][]) => {
  const activeChunk: Chunk = findChunk(pos, chunks);
  const [worldColumnIndex, worldRowIndex] = getWorldIndex(pos);

  const localColumn = ((worldColumnIndex % chunkSize) + chunkSize) % chunkSize;

  const localRow = ((worldRowIndex % chunkSize) + chunkSize) % chunkSize;

  //console.log(worldColumnIndex);

  return activeChunk.blocks[localColumn][localRow];
};

export const calculateBlockCollision = (
  movingUnit: Object,
  chunks: Chunk[][],
  dt: number
) => {
  const inputtedPos = movingUnit.body.translation();
  const inputtedVel = multVar(movingUnit.body.linvel(), dt);

  const leftSide = inputtedPos.x - movingUnit.dimensions.width / 2;
  const rightSide = inputtedPos.x + movingUnit.dimensions.width / 2;
  const upSide = inputtedPos.y - movingUnit.dimensions.height / 2;
  const downSide = inputtedPos.y + movingUnit.dimensions.height / 2;

  const sides: number[] = [leftSide, rightSide, upSide, downSide];

  const futurePos = add(inputtedPos, multVar(inputtedVel, dt));
  //console.log(movingUnit);

  const collidingBlocks = [];
  sides.forEach((sidePos: number) => {
    collidingBlocks.push(findBlock(addVar(inputtedVel, sidePos), chunks));
  });

  console.log(collidingBlocks);

  collidingBlocks.forEach((block) => {
    if (block.material.solid) {
      movingUnit.body.applyImpulse(multVar(inputtedVel, -1), true);
    }
  });
};
