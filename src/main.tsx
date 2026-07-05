import { createRoot } from "react-dom/client";
import { ScreenHandler } from "./ScreenHandler";
import { game } from "./Game";
import { Container, Graphics, Sprite } from "pixi.js";
import RAPIER from "@dimforge/rapier2d";
import {
  changeMouseWorldPos,
  keys,
  mouseButtons,
  mousePos,
  mouseWorldPos,
  setupKeyboardListeners,
  setupMouseListeners,
} from "./keyListner";
import { runEventQueueCheck } from "./rapier/eventQueueHandler";
import { generateWorld } from "./world_generation/generateWorld";
import { Chunk } from "./world_generation/createChunk";
import { Dimensions, Object } from "./createCube";
import {
  Camera,
  changeChunksInRender,
  processChunkQueue,
} from "./pixi/renderChunk";
import {
  changeBlock,
  findBlock,
  findBorderingBlocks,
  findChunk,
  Integer,
} from "./findWorldBlocks";
import { getMaterial } from "./world_generation/materials";
import { origo } from "./math/vec";
import { mineBlock } from "./mineBlock";
import { playerStats } from "./inventory/playerStats";
import { cooldownPerSecond, updateCooldown } from "./inventory/updateCooldown";
import { invenstory } from "./inventory/inventory";
import { move } from "./move";

// Refactor segments of code to seperate files
// Clear up some code
// More functions (arrow up)

// Create first elements
const screenSize: Dimensions = {
  width: screen.width,
  height: screen.height,
};

const gravity = { x: 0, y: 980.1 };
const rapierWorld = new RAPIER.World(gravity);
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
    rapierWorld,
    wakeObjects
  );

  const camera: Camera = {
    // Center
    pos: { x: 0, y: 0 },
    // Zoom
    scale: 0.5,
    //scale: 0.1,
    orgWidth: 0,
    orgHeight: 0,
  };

  setupKeyboardListeners();
  setupMouseListeners();

  let fps = 60;
  // Game loop!
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;
    fps = ticker.FPS;
    // calculateBlockCollision(player, chunks, dt);
    rapierWorld.step(eventQueue, rapierHook);

    runEventQueueCheck(eventQueue);

    // reRender chunks when destructed or changed
    // chunks.flat().flatMap((chunk: Chunk) => {
    //   if (chunk.dirty) {
    //     reRenderChunk(app, worldContainer, chunk);
    //   }
    // });

    const playerPos = player.body.translation();
    changeMouseWorldPos(screenSize, camera);

    changeChunksInRender(playerPos, chunks); // queue updates
    processChunkQueue(rapierWorld, app, worldContainer);

    // Sync sprite's pos with body's pos (skip fixed/static bodies — they never move)
    wakeObjects.forEach((object) => {
      if (object.body.isFixed()) return;
      const pos = object.body.translation();
      object.sprite.position.set(pos.x, pos.y);
      object.sprite.rotation = object.body.rotation();
    });

    camera.pos = playerPos;
    worldContainer.scale = camera.scale;
    worldContainer.position.set(
      -camera.pos.x * camera.scale + screenSize.width / 2,
      -camera.pos.y * camera.scale + screenSize.height / 2
    );

    const walkStat = playerStats.movement.walk;
    const jumpStat = playerStats.movement.jump;
    const mineStat = playerStats.mining;

    //updateCooldown(dt, jumpStat.cooldown);
    if (keys["KeyW"]) {
      if (jumpStat.cooldown > 0) return;
      move(player, "up", jumpStat.strength * 15);
      // player.body.applyImpulse({ x: 0, y: -jumpStat.strength * 15 }, true);

      jumpStat.cooldown = 1;
    }
    if (keys["KeyS"]) {
      move(player, "down", jumpStat.strength * 15);
      //player.body.applyImpulse({ x: 0, y: jumpStat.strength }, true);
    }
    if (keys["KeyA"]) {
      move(player, "left", walkStat.strength);
      //player.body.applyImpulse({ x: -walkStat.strength, y: 0 }, true);
    }
    if (keys["KeyD"]) {
      move(player, "right", walkStat.strength);
      // player.body.applyImpulse({ x: walkStat.strength, y: 0 }, true);
    }
    if (keys["KeyO"]) {
      camera.scale *= 0.97;
    }
    if (keys["KeyP"]) {
      camera.scale /= 0.97;
    }

    // Player-world-interactions
    mineStat.cooldown = updateCooldown(dt, mineStat.cooldown);

    if (mouseButtons["Left"]) {
      if (mineStat.cooldown > 0) return;
      mineBlock(chunks, mouseWorldPos, playerStats);
      mineStat.cooldown = mineStat.speed;
    }
    if (mouseButtons["Right"]) {
      // invenstory.inventory.push(materialInt);
      const pos = mouseWorldPos;
      const chunk = findChunk(pos, chunks);
      if (!chunk) return;
      const [idx, materialInt] = findBlock(pos, chunk);

      // Only place if the target block is air
      if (getMaterial(materialInt).solid) return;

      // Only place if at least one adjacent block is solid
      const hasAdjacentSolid = findBorderingBlocks(pos, chunks, 1)
        .flat()
        .some(
          (b: [number, number] | undefined) =>
            b !== undefined && getMaterial(b[1]).solid
        );
      if (!hasAdjacentSolid) return;

      changeBlock(chunk.blocks, idx, "earth");
      chunk.renderdChange = true;
    }
  });
});
