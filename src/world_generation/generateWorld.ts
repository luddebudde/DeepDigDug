import RAPIER from "@dimforge/rapier2d";
import { Container, Graphics } from "pixi.js";
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
import { Block, createChunk } from "../createChunk";

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
//const terrainWithoutGrass = ridges();
//console.log(terrainType);

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
)
  .flat()
  .filter((entry): entry is TerrainEntry => entry[1] !== "air");

export const generateWorld = async (
  worldContainer: Container,
  rapier: RAPIER.World,
  objects: Object[]
): Promise<[Object, Object[]]> => {
  const chunks: Block[][] = [[]];

  const boxes = [...generatedTerrain].map(
    ([val, materialKey, coord, column, row]) => {
      const material = materials[materialKey];
      // const color = material.color(val);

      const block: Block = {
        material: material,
        pos: coord,
        row: row,
        column: column,
      };

      // console.log("column", column, "row", row);

      createChunk(worldContainer, rapier, chunks, block);
      //   console.log(chunks);

      return createCube(
        worldContainer,
        rapier,
        objects,
        {
          pos: coord,
          width: blockSize,
          height: blockSize,
          density: material.density,
          modes: {
            static: true,
            sleep: true,
          },
        },
        { pixiUrl: material.png, zIndex: 1 }
      );
    }
  );
  const CHUNK_SIZE = 32;
  const chunkWorldSize = CHUNK_SIZE * blockSize;

  // UN-COMMENT THIS LATER, FOR DEBUGGING PURPOSES
  // chunks.forEach((column, columnIndex) => {
  //   column.forEach((row, rowIndex) => {
  //     createCube(
  //       worldContainer,
  //       rapier,
  //       objects,
  //       {
  //         pos: {
  //           x: columnIndex * chunkWorldSize + xWorldOffset + chunkWorldSize / 2,
  //           y: rowIndex * chunkWorldSize + chunkWorldSize / 2,
  //         },
  //         width: blockSize * 32,
  //         height: blockSize * 32,
  //         density: 0,
  //         modes: {
  //           static: true,
  //           sleep: true,
  //           sensor: true,
  //         },
  //       },
  //       { pixiUrl: "stone_texture.png", zIndex: 0 }
  //     );

  // const graphics = new Graphics();

  // graphics
  //   .rect(
  //     columnIndex * 32 * blockSize + xWorldOffset,
  //     rowIndex * 32 * blockSize,
  //     32 * blockSize,
  //     32 * blockSize
  //   )
  //   .fill("red");

  // worldContainer.addChild(graphics);
  //   });
  // });

  const worldBlocks = await Promise.all(boxes);

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

  return [player, worldBlocks];
};
