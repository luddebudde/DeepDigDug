import RAPIER from "@dimforge/rapier2d";
import { Assets, Container, Sprite } from "pixi.js";
import { Vec2 } from "./vec2";

export type Object = {
  pos: Vec2;
  body: RAPIER.RigidBody;
  sprite: Sprite;
};

export const createCube = async (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  objects: Object[],
  physics: {
    pos: Vec2;
    width: number;
    height: number;
    density: number;
    isStatic?: boolean;
    isSensor: boolean;
  },
  pixi?: {
    sprite: string;
    zIndex?: number;
  }
): Promise<Object> => {
  const rectangleDesc = physics.isStatic
    ? RAPIER.RigidBodyDesc.fixed()
    : RAPIER.RigidBodyDesc.dynamic();

  rectangleDesc.setTranslation(physics.pos.x, physics.pos.y);
  const rectangleBody = rapierWorld.createRigidBody(rectangleDesc);

  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    physics.width / 2,
    physics.height / 2
  ).setDensity(physics.density);
  rapierWorld
    .createCollider(colliderDesc, rectangleBody)
    .setSensor(physics.isSensor);

  const sprite = pixi === undefined ? "coal_texture" : pixi.sprite;
  const texture = await Assets.load(sprite);

  const rectangleSprite = new Sprite(texture);
  rectangleSprite.anchor.set(0.5);
  rectangleSprite.width = physics.width;
  rectangleSprite.height = physics.height;
  rectangleSprite.zIndex = pixi?.zIndex ?? 0;
  // rectangleSprite.rect(
  //   -physics.width / 2,
  //   -physics.height / 2,
  //   physics.width,
  //   physics.height
  // )

  const alpha = physics.isSensor ? 0.5 : 1;
  // rectangleSprite.alpha = alpha;
  const rectangle = {
    pos: rectangleBody.translation(),
    body: rectangleBody,
    sprite: rectangleSprite,
  };

  objects.push(rectangle);
  worldContainer.addChild(rectangleSprite);

  return rectangle;
};
