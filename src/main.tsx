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

const gravity = { x: 0, y: 980.1 };
const rapier = new RAPIER.World(gravity);

createRoot(document.getElementById("root")!).render(<ScreenHandler />);

// Creating "game"
game.ready.then(async () => {
  // Post-game creation; before game loop
  const squareSize = 50;
  const blockSize = 100;

  const worldContainer: Container = new Container();
  worldContainer.sortableChildren = true;

  game.app.stage.addChild(worldContainer);

  // Create test objects; floor and cube

  const worldBlocks = [...Array(squareSize)].flatMap((verticles, ia) => {
    console.log(ia);
    [...Array(squareSize / 2)].flatMap((block, i) => {
      const margin = (squareSize * blockSize) / 2;

      const xPos = blockSize * (ia + 1) - (squareSize * blockSize) / 2;
      const yPos = margin + blockSize * (i + 1) - margin;

      const isSensor = yPos > 200 ? false : true;
      return createCube(
        worldContainer,
        rapier,
        objects,
        {
          pos: {
            x: xPos,
            y: yPos,
          },
          width: blockSize,
          height: blockSize,
          density: 0.0001,
          isStatic: true,
          isSensor: isSensor,
        },
        { sprite: "dirt_texture.png", zIndex: 0 }
      );
    });
  });

  // const floor = createCube(worldContainer, rapier, objects, {
  //   pos: { x: world.width / 2, y: 200 },
  //   width: world.width,
  //   height: 50,
  //   density: 0.01,
  //   isStatic: true,
  // });

  const player = await createCube(
    worldContainer,
    rapier,
    objects,
    {
      pos: { x: 0, y: 0 },
      width: 50,
      height: 50,
      density: 0.001,
      isSensor: false,
    },
    { sprite: "coal_texture.png", zIndex: 1 }
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
    rapier.step();

    // Sync sprite's pos with body's pos
    objects.forEach((object) => {
      object.sprite.position.set(
        object.body.translation().x,
        object.body.translation().y
      );
      object.sprite.rotation = object.body.rotation();

      camera.pos = player.body.translation();
      worldContainer.position.set(
        -camera.pos.x + world.width / 2,
        -camera.pos.y + world.heigth / 2
      );
    });

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
