import RAPIER from "@dimforge/rapier2d";
import { Vec2 } from "../math/vec";

export const createBody = (
  rapierWorld: RAPIER.World,
  pos: Vec2,
  dimensions: {
    width: number;
    height: number;
  },
  density: number,
  staticMode?: boolean,
  sensorMode?: boolean,
  sleepMode?: boolean
): RAPIER.RigidBody => {
  const isStatic = staticMode ?? false;
  const isSensor = sensorMode ?? false;

  const bodyDesc = isStatic
    ? RAPIER.RigidBodyDesc.fixed()
    : RAPIER.RigidBodyDesc.dynamic();

  bodyDesc.setTranslation(pos.x, pos.y);
  const body = rapierWorld.createRigidBody(bodyDesc);

  const colliderMesh = RAPIER.ColliderDesc.cuboid(
    dimensions.width / 2,
    dimensions.height / 2
  )
    .setDensity(density)
    .setActiveEvents(
      staticMode === false
        ? RAPIER.ActiveEvents.COLLISION_EVENTS
        : RAPIER.ActiveEvents.NONE
    );

  // Apply collider
  rapierWorld.createCollider(colliderMesh, body).setSensor(isSensor);

  return body;
};
