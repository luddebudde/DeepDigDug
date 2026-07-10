import RAPIER from "@dimforge/rapier2d";
import { Application, Container } from "pixi.js";
import { createCube, Object } from "../createCube";
import { getMaterialId, materials } from "./materials";
import { mapMat } from "../math/matrix";
import { caves } from "./perlin_matrix/perlinCaves";

import { Vec2 } from "../math/vec";
import { ridges } from "./perlin_matrix/perlinRidges";
import { Chunk, createChunk } from "./createChunk";

type MaterialKey = keyof typeof materials;
type TerrainEntry = [number, MaterialKey, Vec2, number, number];

const terrainWithoutGrass = caves();

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
      isEarth && isBelowAir ? "grass" : material,
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
    // console.log(materialKey, getMaterialId(materialKey));

    const materialId = getMaterialId(materialKey);

    createChunk(
      worldContainer,
      rapier,
      chunks,
      { row: row, column: column },
      materialId
    );
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

  // const chunkPromises = chunks.flatMap((chunkColumn: Chunk[], columnIndex) =>
  //   chunkColumn.map((chunk: Chunk, rowIndex) =>
  //     renderChunk(app, worldContainer, chunk)
  //   )
  // );
  // await Promise.all(chunkPromises);

  const player = await createCube(
    worldContainer,
    rapier,
    objects,
    "player",
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
