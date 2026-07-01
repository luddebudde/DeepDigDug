import {
  Application,
  Assets,
  Container,
  RenderTexture,
  Sprite,
  Texture,
  TEXTURE_FORMAT_BLOCK_SIZE,
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
import { findBorderingChunks, idxToGrid } from "../findWorldBlocks";
import { createVec, cubify, Vec2 } from "../math/vec";
import { createBody } from "../rapier/createBody";
import RAPIER from "@dimforge/rapier2d";
import { getMaterial, materialKeys } from "../world_generation/materials";

type Assets = Record<string, Texture>;

const assets: Assets = {
  air: Texture.EMPTY,
  rock: await Assets.load("stone_texture.png"),
  earth: await Assets.load("dirt_texture.png"),
  grass: await Assets.load("ladder_sprite.png"),
  snow: await Assets.load("diamond_ore.png"),
  ice: await Assets.load("silver_ore.png"),
  rubber: await Assets.load("pickaxe_sprite.png"),
};

export const reRenderChunk = (
  app: Application,
  worldContainer: Container,
  chunk: Chunk
) => {
  //container.updateCacheTexture();
  renderChunk(app, worldContainer, chunk);
};

export const renderChunk = (
  app: Application,
  worldContainer: Container,
  chunk: Chunk
) => {
  // Clean up old sprite/texture before creating new ones
  if (chunk.sprite) {
    worldContainer.removeChild(chunk.sprite);
    chunk.sprite.destroy();
  }
  if (chunk.renderTexture) {
    chunk.renderTexture.destroy(true); // true = also destroy base texture (GPU memory)
  }

  const chunkContainer = new Container();
  const trueChunkSize = chunkRelSize * blockSize;

  const sprites = Array.from(chunk.blocks)
    .map((block: number, index: number) => ({ block, index }))
    .filter(({ block }) => getMaterial(block).solid)
    .map(({ block, index }) => {
      const materialName = materialKeys[block];
      if (!materialName) {
        console.warn("Invalid block id — no material name found:", block);
      }
      const texture = assets[materialName];
      if (!texture) {
        console.warn(
          "No texture found for material:",
          materialName,
          "block id:",
          block
        );
      }
      const sprite: Sprite = createSprite(
        { width: blockSize, height: blockSize },
        texture,
        1
      );
      if (!sprite) {
        console.warn("createSprite returned undefined for block id:", block);
      }
      const [row, column] = idxToGrid(index);
      sprite.x = column * blockSize + blockSize / 2;
      sprite.y = row * blockSize + blockSize / 2;
      return sprite;
    })
    .filter((sprite: Sprite) => sprite != null);

  if (sprites.length > 0) {
    chunkContainer.addChild(...sprites);
  }

  const renderTexture = RenderTexture.create({
    width: chunkRelSize * blockSize,
    height: chunkRelSize * blockSize,
  });

  chunk.renderTexture = renderTexture;
  app.renderer.render({ container: chunkContainer, target: renderTexture });

  const chunkSprite = new Sprite(renderTexture);
  chunkSprite.x = chunk.column * trueChunkSize + xWorldOffset - blockSize / 2;
  chunkSprite.y = chunk.row * trueChunkSize - blockSize / 2;

  worldContainer.addChild(chunkSprite);
  chunk.sprite = chunkSprite;

  chunkContainer.destroy({ children: true }); // this part you already do — good
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

const CHUNKS_PER_FRAME = 2; // tune this — 1-2 is smooth, higher = faster load but more stutter

export const processChunkQueue = (
  rapierWorld: RAPIER.World,
  app: Application,
  worldContainer: Container
) => {
  for (let i = 0; i < CHUNKS_PER_FRAME && chunksToRemove.length > 0; i++) {
    const chunk = chunksToRemove.shift()!;

    // Actually free GPU/CPU resources instead of just hiding
    if (chunk.sprite) {
      worldContainer.removeChild(chunk.sprite);
      chunk.sprite.destroy();
      chunk.sprite = undefined;
    }
    if (chunk.renderTexture) {
      chunk.renderTexture.destroy(true);
      chunk.renderTexture = undefined;
    }

    if (chunk.rapier.body) {
      rapierWorld.removeRigidBody(chunk.rapier.body);
      chunk.rapier.body = undefined;
    }
  }

  for (let i = 0; i < CHUNKS_PER_FRAME && chunksToAdd.length > 0; i++) {
    const chunk = chunksToAdd.shift()!;

    addChunkToPhysics(rapierWorld, chunk);

    // chunk.sprite is now always undefined after being removed,
    // so this always re-renders fresh — no stale "just show it again" path
    renderChunk(app, worldContainer, chunk);
  }
};

// 2. DEDUPLICATE — don't rebuild chunks that are already loaded
export const changeChunksInRender = (
  rapierWorld: RAPIER.World,
  playerPos: Vec2,
  chunks: Chunk[][]
) => {
  const range = 3; // 2 = 5x5 area centered on player, tune down to 1 for 3x3

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
  // Guard: don't create a second body if one already exists
  if (chunk.rapier.body) return;

  const body = rapierWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  chunk.rapier.body = body;

  const trueChunkSize = chunkRelSize * blockSize;
  // The chunk sprite top-left sits at (chunk.column * trueChunkSize + xWorldOffset - blockSize/2)
  // in world-space, so the world origin for local rect coordinates is:
  const chunkWorldX =
    chunk.column * trueChunkSize + xWorldOffset - blockSize / 2;
  const chunkWorldY = chunk.row * trueChunkSize - blockSize / 2;

  const rects = greedyMergeBlocks(chunk);

  rects.forEach(({ x, y, w, h }) => {
    // x/y are the left/top pixel edges of the rect in local chunk texture space.
    // The rect centre in world space = chunkWorldOrigin + local edge + half-extent.
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      (w * blockSize) / 2,
      (h * blockSize) / 2
    ).setTranslation(
      chunkWorldX + x + (w * blockSize) / 2,
      chunkWorldY + y + (h * blockSize) / 2
    );

    rapierWorld.createCollider(colliderDesc, body);
  });
};
const greedyMergeBlocks = (
  chunk: Chunk
): { x: number; y: number; w: number; h: number }[] => {
  const cols = chunkRelSize;
  const rows = chunkRelSize;

  const remaining: boolean[] = [];

  //  console.log(chunk.blocks.length);

  for (const value of chunk.blocks) {
    const isSolid = getMaterial(value).solid ?? false;

    remaining.push(isSolid);
  }

  const getIdx = (col: number, row: number) => row * cols + col;

  const rects: { x: number; y: number; w: number; h: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!remaining[getIdx(col, row)]) continue;

      // Expand down (increasing row) as far as possible
      let height = 1;
      while (row + height < rows && remaining[getIdx(col, row + height)])
        height++;

      // Expand right (increasing col) while all rows in height are solid
      let width = 1;
      while (col + width < cols) {
        const colSolid = Array.from(
          { length: height },
          (_, i) => remaining[getIdx(col + width, row + i)]
        ).every(Boolean);
        if (!colSolid) break;
        width++;
      }

      // Mark consumed
      for (let c = col; c < col + width; c++)
        for (let r = row; r < row + height; r++)
          remaining[getIdx(c, r)] = false;

      //const block = chunk.blocks[getIdx(col, row)];

      //console.log(col * blockSize);

      rects.push({
        x: col * blockSize,
        y: row * blockSize,
        w: width,
        h: height,
      });
    }
  }

  return rects;
};
