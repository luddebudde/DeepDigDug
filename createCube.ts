import RAPIER from "@dimforge/rapier2d";
import { Container, Graphics, Sprite } from "pixi.js";
import { Vec2 } from "./vec2";

export type Object = {
  pos: Vec2;
  body: RAPIER.RigidBody;
  sprite: Graphics;
};

export const createCube = (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  objects: Object[],
  physics: {
    pos: Vec2;
    width: number;
    height: number;
    density: number;
    isStatic?: boolean;
  },
  pixi?: {
    sprite: string;
  }
): Object => {
  const rectangleDesc = physics.isStatic
    ? RAPIER.RigidBodyDesc.fixed()
    : RAPIER.RigidBodyDesc.dynamic();

  rectangleDesc.setTranslation(physics.pos.x, physics.pos.y);
  const rectangleBody = rapierWorld.createRigidBody(rectangleDesc);

  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    physics.width / 2,
    physics.height / 2
  )
    .setDensity(physics.density)
    .setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS);
  rapierWorld.createCollider(colliderDesc, rectangleBody);

  const pos = rectangleBody.translation();
  const rectangleSprite = new Graphics()
    .rect(
      -physics.width / 2,
      -physics.height / 2,
      physics.width,
      physics.height
    )
    .fill(0xff4466);

  const rectangle = {
    pos: rectangleBody.translation(),
    body: rectangleBody,
    sprite: rectangleSprite,
  };

  objects.push(rectangle);
  worldContainer.addChild(rectangleSprite);

  return rectangle;
};
