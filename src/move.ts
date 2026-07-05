import { Object } from "./createCube";
import { playerStats } from "./inventory/playerStats";
import { multVar, Vec2 } from "./math/vec";

const directionMod: Record<string, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const move = (object: Object, direction: string, force: number) => {
  // if (object.type === "player" && !playerStats.movement.onGround) return;
  const body = object.body;
  const directionMult = directionMod[direction];

  body.applyImpulse(multVar(directionMult, force), true);
};
