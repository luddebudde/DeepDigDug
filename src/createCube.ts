import RAPIER from "@dimforge/rapier2d";
import {
  Assets,
  Container,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import { Vec2 } from "@repo/math";
import { createBody } from "./rapier/createBody";
import { createSprite } from "./pixi/createSprite";

export const colliderToEntity = new Map();

export type Dimensions = {
  width: number;
  height: number;
};

export type Object = {
  type: string;
  pos: Vec2;
  body: RAPIER.RigidBody;
  sprite: Sprite | Graphics;
  toughness: number;
  dimensions: Dimensions;
};

export const createCube = async (
  worldContainer: Container,
  rapierWorld: RAPIER.World,
  objects: Object[],
  type: string,
  rapier: {
    pos: Vec2;
    width: number;
    height: number;
    density: number;
    modes?: {
      static?: boolean;
      sensor?: boolean;
      sleep?: boolean;
    };
  },
  pixi?: {
    pixiUrl?: string;
    zIndex?: number;
    color?: string;
  }
): Promise<Object> => {
  // Basic constant declarations
  const dimensions: Dimensions = {
    width: rapier.width,
    height: rapier.height,
  };

  const modes = {
    static: rapier.modes?.static ?? false,
    sensor: rapier.modes?.sensor ?? false,
    sleep: rapier.modes?.sleep ?? true,
  };

  // Creating body
  const body = createBody(
    rapierWorld,
    rapier.pos,
    dimensions,
    rapier.density,
    modes.static,
    modes.sensor,
    modes.sleep
  );

  // Adding texture and creating sprite
  const texture: Texture | undefined = pixi?.pixiUrl
    ? await Assets.load(pixi.pixiUrl)
    : undefined;

  if (texture === undefined) {
    console.log("TEXTURE IS NOT DEFINED!!!!!");
    throw new Error("Texture failed to load: " + pixi?.pixiUrl);
  }
  const sprite: Sprite = createSprite(dimensions, texture, pixi?.zIndex);

  // Create object
  const rectangle: Object = {
    type: type,
    pos: body.translation(),
    body: body,
    sprite: sprite,
    toughness: 100,
    dimensions,
  };

  // Pre-loop sync the BODY and the SPRITE
  const translation = body.translation();
  sprite.position.set(translation.x, translation.y);
  sprite.rotation = body.rotation();

  // Add to eventQueue
  colliderToEntity.set(rectangle.body.handle, rectangle);

  // Push into regular JS arrays
  if (!modes.sleep) {
    objects.push(rectangle);
  }

  worldContainer.addChild(sprite);

  return rectangle;
};
