import RAPIER from "@dimforge/rapier2d";
import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { Vec2 } from "./vec2";
import { Object } from "./main";
import { createBody } from "./rapier/createBody";
import { createSprite } from "./pixi/createSprite";

export const colliderToEntity = new Map();

export const createCube = async (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  objects: Object[],
  physics: {
    pos: Vec2;
    width: number;
    height: number;
    density: number;
    staticMode?: boolean;
    sensorMode: boolean;
  },
  pixi?: {
    pixiUrl?: string;
    zIndex?: number;
  }
): Promise<Object> => {
  const dimensions = {
    width: physics.width,
    height: physics.height,
  };
  const body = createBody(
    rapierWorld,
    physics.pos,
    dimensions,
    physics.density,
    physics.staticMode,
    physics.sensorMode
  );

  const texture: Texture | undefined = pixi?.pixiUrl
    ? await Assets.load(pixi.pixiUrl)
    : undefined;
  const sprite: Sprite | Graphics = createSprite(
    dimensions,
    texture,
    pixi?.zIndex
  );

  const rectangle: Object = {
    pos: body.translation(),
    body: body,
    sprite: sprite,
    toughness: 100,
  };

  colliderToEntity.set(rectangle.body.handle, rectangle);

  objects.push(rectangle);
  worldContainer.addChild(sprite);

  return rectangle;
};
