import RAPIER from "@dimforge/rapier2d";
import {
  Application,
  Assets,
  Container,
  Graphics,
  RenderTexture,
  Sprite,
  Texture,
} from "pixi.js";
import { createCube } from "../createCube";
import { Object } from "../main";
import { materials } from "./materials";
import { mapMat } from "../math/matrix";
import { caves } from "./perlin_matrix/perlinCaves";
import {
  blockSize,
  isWinter,
  worldHeight,
  worldWidth,
  xWorldOffset,
} from "./perlinConstants";
import { Vec2 } from "../math/vec";
import { ridges } from "./perlin_matrix/perlinRidges";
import { log } from "console";
import { zeros2 } from "../math/zeroes";
import { Block, Chunk, createChunk } from "./createChunk";
import { createSprite, getTexture } from "../pixi/createSprite";
import { renderChunk } from "../pixi/renderChunk";

type MaterialKey = keyof typeof materials;
type TerrainEntry = [number, MaterialKey, Vec2, number, number];
const sprites = [
  "dirt_texture.png",
  "coal_texture.png",
  "silver_ore.png",
  "stone_texture.png",
  "diamond_ore.png",
];

const terrainType = Math.random() > 0.5 ? "cave" : "cave";
const terrainWithoutGrass = terrainType === "cave" ? caves() : ridges();

const generatedTerrain = mapMat(
  terrainWithoutGrass,
  (
    [value, material, pos],
    column,
    row
  ): TerrainEntry | [number, "air", Vec2, number, number] => {
    const isEarth = material === "earth";
    const isBelowAir = terrainWithoutGrass[column][row - 1]?.[1] === "air";
    return [
      value,
      isEarth && isBelowAir ? (isWinter ? "snow" : "grass") : material,
      pos,
      column,
      row,
    ];
  }
).flat();
// REMOVE THIS; ALLOW AIR BLOCKS INTO WORLD
//.filter((entry): entry is TerrainEntry => entry[1] !== "air");

export const generateWorld = async (
  app: Application,
  worldContainer: Container,
  rapier: RAPIER.World,
  objects: Object[]
): Promise<[Object, Chunk[][]]> => {
  const chunks: Chunk[][] = [[]];

  [...generatedTerrain].map(([val, materialKey, coord, column, row]) => {
    const material = materials[materialKey];

    const block: Block = {
      material: material,
      materialKey: materialKey,
      pos: coord,
      row: row,
      column: column,
    };

    createChunk(worldContainer, rapier, chunks, block);
  });

  console.log(chunks);

  // CHUNK DEBUGGING, put into forEach loop below
  // createCube(
  //   worldContainer,
  //   rapier,
  //   objects,
  //   {
  //     pos: {
  //       x: columnIndex * chunkWorldSize + xWorldOffset + chunkWorldSize / 2,
  //       y: rowIndex * chunkWorldSize + chunkWorldSize / 2,
  //     },
  //     width: blockSize * 32,
  //     height: blockSize * 32,
  //     density: 0,
  //     modes: {
  //       static: true,
  //       sleep: true,
  //       sensor: true,
  //     },
  //   },
  //   { pixiUrl: "stone_texture.png", zIndex: 0 }
  // );

  const assets = {
    air: await Assets.load(""),
    rock: await Assets.load("stone_texture.png"),
    earth: await Assets.load("dirt_texture.png"),
    grass: await Assets.load("ladder_sprite.png"),
    snow: await Assets.load("diamond_ore.png"),
    ice: await Assets.load("silver_ore.png"),
  };

  const chunkPromises = chunks.flatMap((chunkColumn: Chunk[], columnIndex) =>
    chunkColumn.map((chunk: Chunk, rowIndex) =>
      renderChunk(app, worldContainer, chunk, assets)
    )
  );

  await Promise.all(chunkPromises);
  //const worldChunks: Chunk[][] = await Promise.all(chunkPromises);

  const player = await createCube(
    worldContainer,
    rapier,
    objects,
    {
      pos: { x: 0, y: 0 },
      width: 50,
      height: 50,
      density: 0.001,
      modes: {
        sensor: false,
        sleep: false,
      },
    },
    { pixiUrl: "coal_texture.png", zIndex: 5 }
  );

  return [player, chunks];
};
