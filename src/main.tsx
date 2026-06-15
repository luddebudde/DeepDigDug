import { createRoot } from "react-dom/client";
import { ScreenHandler } from "./ScreenHandler";
import { game } from "./Game";
import { Container, Graphics, Sprite } from "pixi.js";
import RAPIER from "@dimforge/rapier2d";
import { keys, setupKeyboardListeners } from "./keyListner";
import { runEventQueueCheck } from "./rapier/eventQueueHandler";
import { Vec2 } from "./math/vec";
import { log } from "node:console";
import { calculateBlockCollision } from "./calculateBlockCollision";
import { generateWorld } from "./world_generation/generateWorld";
import { reRenderChunk } from "./pixi/renderChunk";
import { Chunk } from "./createChunk";
import { Object } from "./createCube";

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
  filterContactPair(collider1: any, collider2: any, body1: any, body2: any) {
    // Return null to skip contact computation entirely.
    // Return a SolverFlags value to allow contact computation.
    return RAPIER.SolverFlags.COMPUTE_IMPULSE;
  },

  filterIntersectionPair(
    collider1: any,
    collider2: any,
    body1: any,
    body2: any
  ) {
    // Return false to skip intersection testing.
    // Return true to continue and test overlap.
    return true;
  },
};

createRoot(document.getElementById("root")!).render(<ScreenHandler />);

const wakeObjects: Object[] = [];

// Creating "game"
game.ready.then(async (app) => {
  // Post-game creation; before game loop
  const worldContainer: Container = new Container();
  worldContainer.sortableChildren = true;
  worldContainer.sortableChildren = false;

  app.stage.addChild(worldContainer);

  const [player, chunks] = await generateWorld(
    app,
    worldContainer,
    rapier,
    wakeObjects
  );

  const camera = {
    // Center
    pos: { x: 0, y: 0 },
    // Zoom
    scale: 0.5,
    //scale: 0.1,
  };

  setupKeyboardListeners();

  // Game loop!
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;

    rapier.step(eventQueue, rapierHook);

    runEventQueueCheck(eventQueue);

    // reRender chunks when destructed or changed
    // chunks.flat().flatMap((chunk: Chunk) => {
    //   if (chunk.dirty) {
    //     reRenderChunk(app, worldContainer, chunk);
    //   }
    // });

    calculateBlockCollision(player, chunks, dt);

    // Sync sprite's pos with body's pos (skip fixed/static bodies — they never move)
    wakeObjects.forEach((object) => {
      if (object.body.isFixed()) return;
      const pos = object.body.translation();
      object.sprite.position.set(pos.x, pos.y);
      object.sprite.rotation = object.body.rotation();
    });

    camera.pos = player.body.translation();
    worldContainer.scale = camera.scale;
    worldContainer.position.set(
      -camera.pos.x * camera.scale + world.width / 2,
      -camera.pos.y * camera.scale + world.heigth / 2
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
    if (keys["KeyO"]) {
      camera.scale *= 0.97;
    }
    if (keys["KeyP"]) {
      camera.scale /= 0.97;
    }

    if (mouseWheel < 0) {
      // Scroll upwards
      camera.scale *= 0.9;
      mouseWheel = 0;
      console.log("scrool");
    }

    if (mouseWheel > 0) {
      // Scroll downwards
      camera.scale /= 0.9;
      mouseWheel = 0;
    }
  });
});

export let mouseWheel = 0;

export const setupMouseWheel = () => {
  addEventListener("wheel", (e) => {
    mouseWheel = Math.sign(e.deltaY);
  });
};
