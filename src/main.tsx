import { createRoot } from "react-dom/client";
import { ScreenHandler } from "./ScreenHandler";
import { game } from "./Game";
import { Assets, Container, Graphics, Sprite } from "pixi.js";
import RAPIER from "@dimforge/rapier2d";
import { colliderToEntity, createCube } from "./createCube";
import { keys, setupKeyboardListeners } from "./keyListner";
import { runEventQueueCheck } from "./rapier/eventQueueHandler";
import { Vec2 } from "./vec2";
import { generateWorld } from "./generateWorld";

// Refactor segments of code to seperate files
// Clear up some code
// More functions (arrow up)

// Create first elements
const world = {
  width: screen.width,
  heigth: screen.height,
};

const gravity = { x: 0, y: 980.1 };
const rapier = new RAPIER.World(gravity);
const eventQueue = new RAPIER.EventQueue(true);

const rapierHook = {
  filterContactPair(collider1, collider2, body1, body2) {
    // Return null to skip contact computation entirely.
    // Return a SolverFlags value to allow contact computation.
    return RAPIER.SolverFlags.COMPUTE_IMPULSES;
  },

  filterIntersectionPair(collider1, collider2, body1, body2) {
    // Return false to skip intersection testing.
    // Return true to continue and test overlap.
    return true;
  },
};

createRoot(document.getElementById("root")!).render(<ScreenHandler />);

export type Object = {
  pos: Vec2;
  body: RAPIER.RigidBody;
  sprite: Sprite | Graphics;
};

const objects: Object[] = [];

// Creating "game"
game.ready.then(async () => {
  // Post-game creation; before game loop
  const worldContainer: Container = new Container();
  worldContainer.sortableChildren = true;

  game.app.stage.addChild(worldContainer);

  const [player, worldBlocks] = await generateWorld(
    worldContainer,
    rapier,
    objects
  );

  const camera = {
    // Center
    pos: { x: 0, y: 0 },
    // Zoom
    scale: 1,
  };

  setupKeyboardListeners();

  // Game loop!
  game.app.ticker.add(() => {
    rapier.step(eventQueue, rapierHook);

    runEventQueueCheck(eventQueue);

    // Sync sprite's pos with body's pos
    objects.forEach((object) => {
      object.sprite.position.set(
        object.body.translation().x,
        object.body.translation().y
      );
      object.sprite.rotation = object.body.rotation();
    });

    camera.pos = player.body.translation();
    worldContainer.position.set(
      -camera.pos.x + world.width / 2,
      -camera.pos.y + world.heigth / 2
    );

    if (keys["KeyW"]) {
      player.body.applyImpulse({ x: 0, y: -100 }, true);
    }
    if (keys["KeyS"]) {
      player.body.applyImpulse({ x: 0, y: 100 }, true);
    }
    if (keys["KeyA"]) {
      player.body.applyImpulse({ x: -100, y: 0 }, true);
    }
    if (keys["KeyD"]) {
      player.body.applyImpulse({ x: 100, y: 0 }, true);
    }
  });
});
