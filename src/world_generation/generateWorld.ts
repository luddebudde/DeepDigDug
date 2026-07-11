import RAPIER from "@dimforge/rapier2d";
import { Application, Container } from "pixi.js";
import { createCube, Object } from "../createCube";
import { getMaterialId, materials } from "./materials";
import { mapMat } from "../math/matrix";
import { caves } from "./perlin_matrix/perlinCaves";
import { surfaceLevel, surfaceRows } from "./perlin_matrix/perlinSurface";
import { Chunk, createChunk } from "./createChunk";
import { zeros2 } from "../math/zeroes";
import {
  cavesThresHold,
  horizontalBoxes,
  verticalBoxes,
} from "./perlinConstants";
import { biomeMap } from "./perlin_matrix/perlinBiomes";
import {
  ancientOreNoise,
  coalNoise,
  diamondNoise,
  ironNoise,
  treeOreNoise,
} from "./perlin_matrix/perlinOres";

type MaterialKey = keyof typeof materials;

const surfaceRow = surfaceRows(); // number[]   — one row index per column
const cave = caves(); // number[][] — fade-border cave density (low = air)
const biomes = biomeMap(); // Biome[]   — one biome per column

// terrain[col][row] = [materialKey, col, row]
const terrain = mapMat(
  zeros2(horizontalBoxes, verticalBoxes),
  (_, col, row): [MaterialKey, number, number] => {
    const relDepth = (row - surfaceRow[col]) / verticalBoxes;

    // Layer 1: above surface → air
    if (row < surfaceRow[col]) return ["air", col, row];

    // Layer 2: cave hole → air.
    // Skip within 5 blocks of the surface so caves never eat through the
    // top layer (which also guarantees Layer 4 is always reachable).
    const minCaveDepth = 5;
    if (row > surfaceRow[col] + minCaveDepth && cave[col][row] < cavesThresHold)
      return ["air", col, row];

    // Layer 3: ores — deeper ores checked first
    if (relDepth > 0.6 && diamondNoise[col][row] > 0.995)
      return ["diamond", col, row];
    if (relDepth > surfaceLevel * 2 && ironNoise[col][row] > 0.95)
      return ["iron", col, row];
    if (
      relDepth > 0 &&
      relDepth < surfaceLevel &&
      treeOreNoise[col][row] > 0.95
    )
      return ["treeOre", col, row];
    if (
      relDepth > 0 &&
      relDepth < surfaceLevel &&
      ancientOreNoise[col][row] > 0.999
    )
      return ["treeOre", col, row];
    if (
      relDepth > surfaceLevel * 0.66 &&
      relDepth < 0.6 &&
      coalNoise[col][row] > 0.9
    )
      return ["coal", col, row];

    // Layer 4: top surface block — colour depends on biome
    if (row === surfaceRow[col]) {
      const biome = biomes[col];
      if (biome === "tundra") return ["snow", col, row];
      // if (biome === "desert") return ["sand", col, row];
      return ["grass", col, row];
    }

    // Future "idea" for biome impacts!
    // Layer 5: biome-aware subsurface
    // const biome = biomes[col];
    // if (biome === "tundra") {
    //   // tundra: freezes deeper, ice layer near surface
    //   if (relDepth < 0.1) return ["ice", col, row];
    //   return [relDepth > 0.3 ? "rock" : "earth", col, row]; // rock starts shallower
    // }
    // // plains (default)
    // return [relDepth > 0.4 ? "rock" : "earth", col, row];

    // Layer 5: subsurface — gets rockier with depth
    return [relDepth > surfaceLevel ? "rock" : "earth", col, row];
  }
);

// --- OLD terrain pipeline (kept for reference) ---
// const terrainWithoutGrass = caves();  // returned [value, material, pos][][]
// const terrainWithoutGrass = surface(); // same shape, surface-based
// const generatedTerrain = mapMat(terrain, ([material, pos], column, row) => {
//   const isEarth = material === "earth";
//   const isBelowAir = terrain[column][row - 1]?.[0] === "air";
//   return [value, isEarth && isBelowAir ? "grass" : material, pos, column, row];
// }).flat();

export const generateWorld = async (
  app: Application,
  worldContainer: Container,
  rapier: RAPIER.World,
  objects: Object[]
): Promise<[Object, Chunk[][]]> => {
  const chunks: Chunk[][] = [[]];

  terrain.flat().forEach(([materialKey, column, row]) => {
    const materialId = getMaterialId(materialKey);
    createChunk(worldContainer, rapier, chunks, { row, column }, materialId);
  });

  console.log(chunks);

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
