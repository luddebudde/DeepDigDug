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
  xWorldOffset,
} from "../world_generation/perlinConstants";
import { createSprite } from "./createSprite";
import { promises } from "node:dns";
import { findBorderingChunks } from "../findWorldBlocks";
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

  const sprites = await Promise.all(
    chunk.blocks
      .flat()
      .filter((block): block is Block => block !== undefined)
      .map(async (block: Block) => {
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
      })
  );

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

export const changeChunksInRender = (
  rapierWorld: RAPIER.World,
  playerPos: Vec2,
  chunks: Chunk[][]
) => {
  const range = 0;

  const newlyRenderedChunks: Chunk[] = findBorderingChunks(
    playerPos,
    chunks,
    range
  ).flat();

  const removedChunks = chunksInRender.filter((chunk: Chunk) =>
    newlyRenderedChunks.includes(chunk)
  );

  newlyRenderedChunks.map((chunk: Chunk) => {
    const chunkBody = chunk.body;
    chunk.blocks.flat().map((block: Block) => {
      block.collider;
      const colliderMesh = RAPIER.ColliderDesc.cuboid(
        blockSize / 2,
        blockSize / 2
      ).setDensity(block.material.density);

      // Apply collider
      const collider: RAPIER.Collider = rapierWorld.createCollider(
        colliderMesh,
        chunkBody
      );
      collider.setSensor(!block.material.solid ? true : false);
      block.collider = collider;
    });
  });
  console.log(removedChunks, newlyRenderedChunks);

  removedChunks.map((chunk: Chunk) => {
    chunk.blocks.flat().map((block: Block) => {
      rapierWorld.removeRigidBody(block.collider);
    });
  });

  chunksInRender = newlyRenderedChunks;
};
