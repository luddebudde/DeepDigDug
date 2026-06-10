import { createRoot } from "react-dom/client";
import { ScreenHandler } from "./ScreenHandler";
import { game } from "./Game";
import { Assets, Container, Graphics, Sprite } from "pixi.js";
import RAPIER from "@dimforge/rapier2d";
import { createCube, Object } from "./createCube";
import { keys, setupKeyboardListeners } from "./keyListner";

// Create first elements
const world = {
  width: screen.width,
  heigth: screen.height,
};

const objects: Object[] = [];

const gravity = { x: 0, y: 98.1 };
const rapier = new RAPIER.World(gravity);

createRoot(document.getElementById("root")!).render(<ScreenHandler />);

// Creating "game"
game.ready.then(async () => {
  // Post-game creation; before game loop

  const worldContainer: Container = new Container();

  game.app.stage.addChild(worldContainer);

  // Create test objects; floor and cube
  const floor = createCube(worldContainer, rapier, objects, {
    pos: { x: world.width / 2, y: 300 },
    width: world.width,
    height: 50,
    density: 0.01,
    isStatic: true,
  });

  const player = createCube(worldContainer, rapier, objects, {
    pos: { x: 100, y: 100 },
    width: 50,
    height: 50,
    density: 0.01,
  });

  setupKeyboardListeners();

  // Game loop!
  game.app.ticker.add(() => {
    rapier.step();

    // Sync sprite's pos with body's pos
    objects.forEach((object) => {
      object.sprite.position.set(
        object.body.translation().x,
        object.body.translation().y
      );
      object.sprite.rotation = object.body.rotation();

      worldContainer.position.set(
        player.body.translation().x,
        player.body.translation().y
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
});
