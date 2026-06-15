import { Chunk, Block } from "./world_generation/createChunk";
import { Object } from "./createCube";
import { findBlock } from "./findWorldBlocks";
import { multVar, add, Vec2, origo } from "./math/vec";
import { zeros2 } from "./math/zeroes";
import { blockSize } from "./world_generation/perlinConstants";

// export const calculateBlockCollision = (
//   movingUnit: Object,
//   chunks: Chunk[][],
//   dt: number
// ) => {
//   const inputtedPos = movingUnit.body.translation();
//   const inputtedVel = multVar(movingUnit.body.linvel(), dt);
//   const futurePos = add(inputtedPos, inputtedVel);

//   const leftSide = futurePos.x - movingUnit.dimensions.width / 2;
//   const rightSide = futurePos.x + movingUnit.dimensions.width / 2;
//   const upSide = futurePos.y - movingUnit.dimensions.height / 2;
//   const downSide = futurePos.y + movingUnit.dimensions.height / 2;

//   const testPoints = [
//     // Left
//     { x: leftSide, y: futurePos.y },
//     // Right
//     { x: rightSide, y: futurePos.y },
//     // Up
//     { x: futurePos.x, y: upSide },
//     // Down
//     { x: futurePos.x, y: downSide },
//   ];

//   //console.log(movingUnit);

//   testPoints.forEach((sidePos: Vec2) => {
//     const block = findBlock(add(sidePos, inputtedVel), chunks);
//     if (block === undefined) return;
//     if (block.material.solid) {
//       movingUnit.body.setTranslation(block.pos, true);
//       movingUnit.body.setLinvel(origo, true);
//       //console.log(inputtedPos, block.pos);
//     }
//   });

//   collidingBlocks.forEach((block) => {});
// };

export const calculateBlockCollision = (
  movingUnit: Object,
  chunks: Chunk[][],
  dt: number
) => {
  const pos = movingUnit.body.translation();
  const vel = movingUnit.body.linvel();
  const dtVel = multVar(vel, dt);
  const futurePos = add(pos, dtVel);

  const width = movingUnit.dimensions.width;
  const height = movingUnit.dimensions.height;

  const centerBlock = findBlock(futurePos, chunks);

  const nearbyBlockGrid = [];

  const playerLeft = futurePos.x - width / 2;
  const playerRight = futurePos.x + width / 2;
  const playerTop = futurePos.y - height / 2;
  const playerBottom = futurePos.y + height / 2;

  nearbyBlockGrid.map((column, columnIndex) =>
    column.map((block, rowIndex) => {
      const blockLeft = block.pos.x - blockSize / 2;
      const blockRight = block.pos.x + blockSize / 2;
      const blockTop = block.pos.y - blockSize / 2;
      const blockBottom = block.pos.y + blockSize / 2;

      if (playerLeft < blockRight && playerRight > blockLeft) {
        ifCollide(movingUnit, block, { x: -vel.x, y: vel.y });
      }
      if (playerTop < blockBottom && playerBottom > blockTop) {
        ifCollide(movingUnit, block, { x: vel.x, y: -vel.y });
      }
    })
  );
};

const ifCollide = (movingUnit: Object, block: Block, newVel: Vec2) => {
  if (!block.material.solid) return;
  movingUnit.body.setLinvel(newVel, true);
};
