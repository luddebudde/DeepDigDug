import RAPIER from "@dimforge/rapier2d";
import { colliderToEntity } from "../createCube";
import { playerStats } from "../inventory/playerStats";

// Handles COLLISION events, aka what happens at collision
export const runEventQueueCheck = (eventQueue: RAPIER.EventQueue) =>
  eventQueue.drainCollisionEvents(
    (handle1: number, handle2: number, started: boolean) => {
      // const obj1 = rapier.getCollider(handle1);
      // const obj2 = rapier.getCollider(handle2);

      const obj1 = colliderToEntity.get(handle1);
      const obj2 = colliderToEntity.get(handle2);

      const checkIfBlock = (obj: { type?: string } | undefined): boolean => {
        return obj === undefined || obj.type === undefined;
      };

      const doubleCheck = (type: string): boolean => {
        const isPlayerBlockPair =
          (obj1?.type === type && checkIfBlock(obj2)) ||
          (obj2?.type === type && checkIfBlock(obj1));

        return isPlayerBlockPair;
      };

      // When collision starts
      if (started) {
        //console.log("collision event");

        if (doubleCheck("player")) {
          playerStats.movement.onGround = true;
          playerStats.movement.jump.cooldown = 0;
        }
      }
      // When collison ends/didnt start now
      else {
        if (doubleCheck("player")) {
          playerStats.movement.onGround = false;
          playerStats.movement.jump.cooldown = 0;
        }
      }
    }
  );
