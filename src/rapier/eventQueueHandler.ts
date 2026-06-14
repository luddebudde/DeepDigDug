import RAPIER from "@dimforge/rapier2d";
import { colliderToEntity } from "../createCube";

export const runEventQueueCheck = (eventQueue: RAPIER.EventQueue) =>
  eventQueue.drainCollisionEvents(
    (handle1: number, handle2: number, started: boolean) => {
      // const obj1 = rapier.getCollider(handle1);
      // const obj2 = rapier.getCollider(handle2);

      const obj1 = colliderToEntity.get(handle1);
      const obj2 = colliderToEntity.get(handle2);

      if (started) {
      } else {
      }
    }
  );
