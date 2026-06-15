import {
  Application,
  Assets,
  Container,
  RenderTexture,
  Sprite,
  Texture,
} from "pixi.js";
import { Block, Chunk } from "../createChunk";
import {
  blockSize,
  chunkSize,
  xWorldOffset,
} from "../world_generation/perlinConstants";
import { createSprite } from "./createSprite";
import { promises } from "node:dns";

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
  chunk: Chunk
) => {
  const chunkContainer = new Container();
  chunkContainer.cacheAsTexture(true);

  const trueChunkSize = chunkSize * blockSize;

  const sprites = await Promise.all(
    chunk.blocks
      .flat()
      .filter((block): block is Block => block !== undefined)
      .map(async (block: Block) => {
        const texture: Texture = await Assets.load(block.material.png);

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
    width: chunkSize * blockSize,
    height: chunkSize * blockSize,
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
