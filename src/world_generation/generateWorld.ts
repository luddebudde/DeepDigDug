import RAPIER from "@dimforge/rapier2d";
import { Container } from "pixi.js";
import { createCube } from "../createCube";
import { Object } from "../main";
import { materials } from "./materials";
import { mapMat } from "../math/matrix";
import { caves } from "./perlin_matrix/perlinCaves";
import { isWinter } from "./perlinConstants";
import { Vec2 } from "../math/vec";

type MaterialKey = keyof typeof materials;
type TerrainEntry = [number, MaterialKey, Vec2];
const sprites = [
  "dirt_texture.png",
  "coal_texture.png",
  "silver_ore.png",
  "stone_texture.png",
  "diamond_ore.png",
];

//  const terrainWithoutGrass = Math.random() > 0.5 ? ridges() : caves()
const terrainWithoutGrass = caves();

const generatedTerrain = mapMat(
  terrainWithoutGrass,
  (
    [value, material, pos],
    row,
    column
  ): TerrainEntry | [number, "air", Vec2] => {
    const isEarth = material === "earth";
    const isBelowAir = terrainWithoutGrass[row][column - 1]?.[1] === "air";
    return [
      value,
      isEarth && isBelowAir ? (isWinter ? "snow" : "grass") : material,
      pos,
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
  const boxes = [...generatedTerrain].map(([val, materialKey, coord]) => {
    const material = materials[materialKey];
    const color = material.color(val);

    return createCube(
      worldContainer,
      rapier,
      objects,
      {
        pos: coord,
        width: 50,
        height: 50,
        density: material.density,
        modes: {
          static: true,
          sleep: true,
        },
      },
      { pixiUrl: material.png }
    );
  });

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
    { pixiUrl: "coal_texture.png", zIndex: 1 }
  );

  return [player, worldBlocks];
};
