import RAPIER from "@dimforge/rapier2d";
import { Container, Sprite } from "pixi.js";
import { createCube } from "./createCube";
import { Object } from "./main";

const sprites = [
  "dirt_texture.png",
  "coal_texture.png",
  "silver_ore.png",
  "stone_texture.png",
  "diamond_ore.png",
];

export const generateWorld = async (
  worldContainer: Container,
  rapier: RAPIER.World,
  objects: Object[]
): Promise<[Object, Object[]]> => {
  const blockSize = 25;
  const squareCount = 100;

  // Create test objects; floor and player
  const worldBlockPromises = [...Array(squareCount)].flatMap(
    (verticles, ia): Promise<Object>[] => {
      return [...Array(Math.round(squareCount / 2))].flatMap(
        (block, i): Promise<Object> => {
          const margin = (squareCount * blockSize) / 2;

          const xPos = blockSize * (ia + 1) - (squareCount * blockSize) / 2;
          const yPos = margin + blockSize * (i + 1) - margin;

          const sprite = sprites[Math.floor(Math.random() * sprites.length)];

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
              staticMode: true,
              sensorMode: isSensor,
            },
            {
              pixiUrl: sprite,
              zIndex: 0,
            }
          );
        }
      );
    }
  );

  const worldBlocks = await Promise.all(worldBlockPromises);

  const player = await createCube(
    worldContainer,
    rapier,
    objects,
    {
      pos: { x: 0, y: 0 },
      width: 50,
      height: 50,
      density: 0.001,
      sensorMode: false,
    },
    { pixiUrl: "coal_texture.png", zIndex: 1 }
  );

  return [player, worldBlocks];
};
