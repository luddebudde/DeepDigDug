import { Application, Container, RenderTexture, Sprite } from "pixi.js";
import { Chunk } from "../world_generation/createChunk";
import {
  blockSize,
  chunkRelSize,
  xWorldOffset,
} from "../world_generation/perlinConstants";
import { createSprite } from "./createSprite";
import { findBorderingChunks, idxToGrid } from "../findWorldBlocks";
import { Vec2 } from "../math/vec";
import RAPIER from "@dimforge/rapier2d";
import {
  assets,
  getMaterial,
  materialKeys,
} from "../world_generation/materials";

export type Camera = {
  // Center
  pos: Vec2;
  // Zoom
  scale: number;
  orgWidth: number;
  orgHeight: number;
};

export const reRenderChunk = (
  app: Application,
  worldContainer: Container,
  chunk: Chunk
) => {
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
    .map(({ block: materialIdx, index }) => {
      const materialName = materialKeys[materialIdx];
      if (!materialName) {
        console.warn("Invalid block id — no material name found:", materialIdx);
      }
      const texture = assets[materialName];
      if (!texture) {
        console.warn(
          "No texture found for material:",
          materialName,
          "block id:",
          materialIdx
        );
      }
      const sprite: Sprite = createSprite(
        { width: blockSize, height: blockSize },
        texture,
        1
      );
      if (!sprite) {
        console.warn("createSprite returned undefined for block id:", materialIdx);
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

  chunkContainer.destroy({ children: true });
};

let chunksInRender: Chunk[] = [] as Chunk[];

let chunksToAdd: Chunk[] = [];
let chunksToRemove: Chunk[] = [];
let isProcessing = false;

const CHUNKS_PER_FRAME = 2; // More === stutter and always rendering

export const processChunkQueue = (
  rapierWorld: RAPIER.World,
  app: Application,
  worldContainer: Container
) => {
  for (let i = 0; i < CHUNKS_PER_FRAME && chunksToRemove.length > 0; i++) {
    const chunk = chunksToRemove.shift()!;

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

    renderChunk(app, worldContainer, chunk);
  }
};

export const changeChunksInRender = (playerPos: Vec2, chunks: Chunk[][]) => {
  // Standard: 3
  const range = 3;

  const currentRenderedChunks: Chunk[] = findBorderingChunks(
    playerPos,
    chunks,
    range
  )
    .flat()
    .filter((chunk): chunk is Chunk => chunk !== undefined);

  // Queue removals (chunks that were rendered but no longer should be)
  const unRenderdChunks = chunksInRender.filter(
    (c) => !currentRenderedChunks.includes(c)
  );
  chunksToRemove.push(
    ...unRenderdChunks.filter((c) => !chunksToRemove.includes(c))
  );

  // Queue additions (only truly new chunks — not already loaded or queued)
  const added = currentRenderedChunks.filter(
    (chunk) => !chunksInRender.includes(chunk) && !chunksToAdd.includes(chunk)
  );

  currentRenderedChunks.map((chunk: Chunk) => {
    if (chunk.renderdChange === true) {
      added.push(chunk);
      chunk.renderdChange = false;
    }
  });

  chunksToAdd.push(...added);

  chunksInRender = currentRenderedChunks;
};

// 3. EXTRACT the physics creation so it's reusable and clean
const addChunkToPhysics = (rapierWorld: RAPIER.World, chunk: Chunk) => {
  // Remove stale body (e.g. after a block was mined) to avoid leaked colliders
  if (chunk.rapier.body) {
    rapierWorld.removeRigidBody(chunk.rapier.body);
    chunk.rapier.body = undefined;
  }

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
