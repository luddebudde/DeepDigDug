import { Assets, Sprite, Texture } from "pixi.js";

const textureCache = new Map<string, Texture>();

export const getTexture = async (path: string): Promise<Texture> => {
  const cached = textureCache.get(path);
  if (cached) return cached;

  const texture = await Assets.load(path);
  textureCache.set(path, texture);
  return texture;
};

export const createSprite = (
  dimensions: { width: number; height: number },
  texture: Texture,
  priorityIndex?: number
): Sprite => {
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.width = dimensions.width;
  sprite.height = dimensions.height;
  sprite.zIndex = priorityIndex ?? 0;
  sprite.cullable = true;

  return sprite;
};
