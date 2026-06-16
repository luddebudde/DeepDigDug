import {
  Application,
  Assets,
  Container,
  RenderTexture,
  Sprite,
  Texture,
} from "pixi.js";
import { Block, Chunk } from "../world_generation/createChunk";
import {
  blockSize,
  chunkRelSize,
  chunkSize,
  xWorldOffset,
} from "../world_generation/perlinConstants";
import { createSprite } from "./createSprite";
import { promises } from "node:dns";
import { findBorderingChunks, getWorldIndex } from "../findWorldBlocks";
import { createVec, cubify, Vec2 } from "../math/vec";
import { createBody } from "../rapier/createBody";
import RAPIER from "@dimforge/rapier2d";

export const reRenderChunk = (
  app: Application,
  worldContainer: Container,
  chunk: Chunk
) => {
  //container.updateCacheTexture();
  renderChunk(app, worldContainer, chunk);
};

export const renderChunk = async (
  app: Application,
  worldContainer: Container,
  chunk: Chunk,
  assets
) => {
  const chunkContainer = new Container();
  chunkContainer.cacheAsTexture(true);

  const trueChunkSize = chunkRelSize * blockSize;

  const sprites = chunk.blocks
    .flat()
    .filter((block): block is Block => block !== undefined)
    .map((block: Block) => {
      //const texture: Texture = await Assets.load(block.material.png);
      const texture = assets[block.materialKey];

      const sprite = createSprite(
        { width: blockSize, height: blockSize },
        texture,
        1
      );

      sprite.x =
        block.pos.x -
        (chunk.column * trueChunkSize + xWorldOffset) +
        blockSize / 2;
      sprite.y = block.pos.y - chunk.row * trueChunkSize + blockSize / 2;

      return sprite;
    });

  chunkContainer.addChild(...sprites);

  const renderTexture = RenderTexture.create({
    width: chunkRelSize * blockSize,
    height: chunkRelSize * blockSize,
  });
  chunk.renderTexture = renderTexture;
  app.renderer.render({
    container: chunkContainer,
    target: renderTexture,
  });

  const chunkSprite = new Sprite(renderTexture);
  chunkSprite.x = chunk.column * trueChunkSize + xWorldOffset - blockSize / 2;
  chunkSprite.y = chunk.row * trueChunkSize - blockSize / 2;

  worldContainer.addChild(chunkSprite);
  chunkContainer.destroy({ children: true });
};

let chunksInRender: Chunk[] = [] as Chunk[];

// export const changeChunksInRender = (
//   rapierWorld: RAPIER.World,
//   playerPos: Vec2,
//   chunks: Chunk[][]
// ) => {
//   const range = 0;

//   const currentRenderdChunks: Chunk[] =
//     // Returns (Chunk | undefined)[][]
//     findBorderingChunks(playerPos, chunks, range)
//       // Returns (Chunk | undefined)[]
//       .flat()
//       // Returns Chunk[]
//       .filter((chunk: Chunk | undefined) => chunk !== undefined);

//   //.flat();

//   const removedChunks: Chunk[] = chunksInRender.filter(
//     (chunk: Chunk) => !currentRenderdChunks.includes(chunk)
//   );

//   // Returns new chunks
//   const newlyAddedChunks: Chunk[] = currentRenderdChunks.filter(
//     (chunk: Chunk) => !chunksInRender.includes(chunk)
//   );

//   //  console.log(currentRenderdChunks, removedChunks, newlyAddedChunks);

//   newlyAddedChunks.map((chunk: Chunk) => {
//     const chunkRapier = chunk.rapier;
//     chunkRapier.body = rapierWorld.createRigidBody(chunkRapier.desc);
//     chunk.blocks.flat().map((block: Block) => {
//       if (!block.material.solid) return;
//       const colliderMesh = RAPIER.ColliderDesc.cuboid(
//         blockSize / 2,
//         blockSize / 2
//       ).setDensity(block.material.density);

//       // Apply collider
//       const collider: RAPIER.Collider = rapierWorld.createCollider(
//         colliderMesh,
//         chunkRapier.body
//       );
//       collider.setSensor(!block.material.solid ? true : false);
//       block.collider = collider;
//     });
//   });
//   //console.log(removedChunks, newlyRenderedChunks);

//   removedChunks.map((chunk: Chunk) => {
//     rapierWorld.removeRigidBody(chunk.rapier.body);
//     // chunk.blocks.flat().map((block: Block) => {
//     //   if (block.collider === undefined) return;
//     //   rapierWorld.removeRigidBody(chunk.rapier.body);
//     // });
//   });

//   chunksInRender = currentRenderdChunks;
// };

// 1. SPREAD THE WORK — process chunks over multiple frames using a queue
let chunksToAdd: Chunk[] = [];
let chunksToRemove: Chunk[] = [];
let isProcessing = false;

const CHUNKS_PER_FRAME = 1; // tune this — 1-2 is smooth, higher = faster load but more stutter

export const processChunkQueue = (rapierWorld: RAPIER.World) => {
  // Remove first — frees memory before allocating
  for (let i = 0; i < CHUNKS_PER_FRAME && chunksToRemove.length > 0; i++) {
    const chunk = chunksToRemove.shift()!;
    if (chunk.rapier.body) {
      rapierWorld.removeRigidBody(chunk.rapier.body);
      chunk.rapier.body = undefined;
    }
  }

  // Then add
  for (let i = 0; i < CHUNKS_PER_FRAME && chunksToAdd.length > 0; i++) {
    const chunk = chunksToAdd.shift()!;
    addChunkToPhysics(rapierWorld, chunk);
  }
};

// 2. DEDUPLICATE — don't rebuild chunks that are already loaded
export const changeChunksInRender = (
  rapierWorld: RAPIER.World,
  playerPos: Vec2,
  chunks: Chunk[][]
) => {
  const range = 2; // 2 = 5x5 area centered on player, tune down to 1 for 3x3

  const currentRenderedChunks: Chunk[] = findBorderingChunks(
    playerPos,
    chunks,
    range
  )
    .flat()
    .filter((chunk): chunk is Chunk => chunk !== undefined);

  // Queue removals (chunks that were rendered but no longer should be)
  const removed = chunksInRender.filter(
    (c) => !currentRenderedChunks.includes(c)
  );
  chunksToRemove.push(...removed.filter((c) => !chunksToRemove.includes(c)));

  // Queue additions (only truly new chunks — not already loaded or queued)
  const added = currentRenderedChunks.filter(
    (c) => !chunksInRender.includes(c) && !chunksToAdd.includes(c)
  );
  chunksToAdd.push(...added);

  chunksInRender = currentRenderedChunks;
};

// 3. EXTRACT the physics creation so it's reusable and clean

const addChunkToPhysics = (rapierWorld: RAPIER.World, chunk: Chunk) => {
  const body = rapierWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  chunk.rapier.body = body;

  const rects = greedyMergeBlocks(chunk);

  rects.forEach(({ x, y, w, h }) => {
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      (w * blockSize) / 2,
      (h * blockSize) / 2
    ).setTranslation(
      x + (w * blockSize) / 2 - blockSize / 2, // block.pos is top-left corner of block
      y + (h * blockSize) / 2 - blockSize / 2
    );

    rapierWorld.createCollider(colliderDesc, body);
  });
};

// Greedy merge — combines adjacent solid blocks into large rectangles
// Reduces 256 colliders down to potentially < 10
const greedyMergeBlocks = (
  chunk: Chunk
): { x: number; y: number; w: number; h: number }[] => {
  const cols = chunk.blocks.length; // first index is column
  const rows = chunk.blocks[0].length; // second index is row

  const remaining: boolean[][] = chunk.blocks.map((col) =>
    col.map((block) => block?.material?.solid ?? false)
  );

  const rects: { x: number; y: number; w: number; h: number }[] = [];

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (!remaining[col][row]) continue;

      // Expand down (increasing row) as far as possible
      let height = 1;
      while (row + height < rows && remaining[col][row + height]) height++;

      // Expand right (increasing col) while all rows in height are solid
      let width = 1;
      while (col + width < cols) {
        const colSolid = Array.from(
          { length: height },
          (_, i) => remaining[col + width][row + i]
        ).every(Boolean);
        if (!colSolid) break;
        width++;
      }

      // Mark consumed
      for (let c = col; c < col + width; c++)
        for (let r = row; r < row + height; r++) remaining[c][r] = false;

      // Use block.pos directly — it's already in world pixel coordinates
      const block = chunk.blocks[col][row];
      rects.push({
        x: block.pos.x,
        y: block.pos.y,
        w: width,
        h: height,
      });
    }
  }

  return rects;
};
