import { Assets, Graphics, Sprite, Texture } from "pixi.js";

export const createSprite =  (
  dimensions: { width: number; height: number },
  texture: Texture | undefined,
  priorityIndex?: number
): Sprite | Graphics => {
  if (texture == null) {
    const graphics = new Graphics().rect(
      -dimensions.width / 2,
      -dimensions.height / 2,
      dimensions.width,
      dimensions.height
    );

    //  const alpha = physics.sensorMode ? 0.5 : 1;
    return graphics;
  }

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.width = dimensions.width;
  sprite.height = dimensions.height;
  sprite.zIndex = priorityIndex ?? 0;

  //  const alpha = physics.sensorMode ? 0.5 : 1;
  return sprite;
};
