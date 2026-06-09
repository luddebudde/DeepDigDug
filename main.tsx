import { createRoot } from "react-dom/client";
import { ScreenHandler } from "./ScreenHandler";
import { game } from "./Game";
import { Assets, Graphics, Sprite } from "pixi.js";
import RAPIER from "@dimforge/rapier2d";
import { createCube, Object } from "./createCube";

createRoot(document.getElementById("root")!).render(<ScreenHandler />);

const gravity = { x: 0, y: 9.81 };
const rapierWorld = new RAPIER.World(gravity);

const objects: Object[] = [];

game.ready.then(async () => {
  const floor = createCube(game, rapierWorld, objects, {
    pos: { x: 0, y: 200 },
    width: 2000,
    height: 50,
    density: 1,
    isStatic: false,
  });

  const cube = createCube(game, rapierWorld, objects, {
    pos: { x: 100, y: 100 },
    width: 50,
    height: 50,
    density: 1,
  });

  game.app.ticker.add(() => {
    rapierWorld.step();

    objects.forEach((object) => {
      object.sprite.position.set(
        object.body.translation().x,
        object.body.translation().y
      );
    });
  });
});
