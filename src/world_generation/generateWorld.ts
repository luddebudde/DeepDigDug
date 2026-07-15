import RAPIER from "@dimforge/rapier2d";
import { Application, Container } from "pixi.js";
import { createCube, Object } from "../createCube";
import { getMaterialId, materials } from "./materials";
import { mapMat } from "../math/matrix";
import { caves } from "./perlin_matrix/perlinCaves";
import { surfaceLevel, surfaceRows } from "./perlin_matrix/perlinSurface";
import { Chunk, createChunk } from "./createChunk";
import { zeros2 } from "../math/zeroes";
import { horizontalBoxes, verticalBoxes } from "./perlinConstants";
import {
  SurfaceBiome,
  surfaceBiomeMap,
  getUndergroundBiome,
  undergroundAccentNoise,
} from "./perlin_matrix/perlinBiomes";
import { generateOre } from "./perlin_matrix/perlinOres";

type MaterialKey = keyof typeof materials;

const surfaceRow = surfaceRows(); // number[]   — one row index per column
const cave = caves(); // number[][] — fade-border cave density (low = air)
const surfaceBiomes = surfaceBiomeMap(); // Biome[]   — one biome per column

// terrain[col][row] = [materialKey, col, row]
const terrain = mapMat(
  zeros2(horizontalBoxes, verticalBoxes),
  (_, col, row): [MaterialKey, number, number] => {
    const relDepth = (row - surfaceRow[col]) / verticalBoxes;
    const surfaceBiome: SurfaceBiome = surfaceBiomes[col];

    // Layer 1: above surface → air
    if (row < surfaceRow[col]) return ["air", col, row];

    // Layer 2: cave hole → air.
    // First X block is untouched
    const safeSurfaceWidth = 15;
    if (
      row > surfaceRow[col] + safeSurfaceWidth &&
      cave[col][row] < surfaceBiome.airThreshold
    )
      return ["air", col, row];

    // Generate ores
    const activeOre = generateOre(relDepth, col, row, surfaceBiome.oreFilter);
    if (activeOre !== undefined) {
      return [activeOre.material.name, col, row];
    }

    // Checks if surface or cave
    if (relDepth < surfaceLevel) {
      // SURFACE
      // Create grass
      if (row === surfaceRow[col]) return [surfaceBiome.grass, col, row];
      // Add dirt
      return [surfaceBiome.earth, col, row];
    } else {
      // UNDERGROUND ZONE — select biome by 2D noise
      const caveBiome = getUndergroundBiome(relDepth, col, row);

      // Each underground biome has its own cave openness
      if (cave[col][row] < caveBiome.airThreshold) return ["air", col, row];

      // Accent blocks (mushroom caps, crystals, iron veins...)
      if (
        caveBiome.accent !== undefined &&
        caveBiome.accentChance !== undefined &&
        undergroundAccentNoise[col][row] > caveBiome.accentChance
      )
        return [caveBiome.accent.name as MaterialKey, col, row];

      return [caveBiome.wall.name as MaterialKey, col, row];
    }
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
