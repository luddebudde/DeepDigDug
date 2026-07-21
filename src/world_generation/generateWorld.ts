import RAPIER from "@dimforge/rapier2d";
import { Application, Container } from "pixi.js";
import { createCube, Object } from "../createCube";
import { getMaterialId, materials } from "./materials";
import { caves } from "./perlin_matrix/perlinCaves";
import { surfaceLevel, surfaceRows } from "./perlin_matrix/perlinSurface";
import { Chunk, createChunk } from "./createChunk";
import {
  random,
  mapMat,
  zeros2,
  normalizeNoise,
  perlinThreshold,
} from "@repo/math";
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
    const [primSurfaceBiome, surfaceBiomeStrength, secSurfaceBiome]: [
      SurfaceBiome,
      number,
      SurfaceBiome,
    ] = surfaceBiomes[col];

    const activeSurfaceBiome: SurfaceBiome =
      random(0, 1) < surfaceBiomeStrength ? primSurfaceBiome : secSurfaceBiome;

    // Layer 1: above surface → air
    if (row < surfaceRow[col]) return ["air", col, row];

    const normCaveVal = cave[col][row];
    // Layer 2: cave hole → air.
    // First X block is untouched
    const safeSurfaceWidth = 15;
    if (
      relDepth < surfaceLevel &&
      row > surfaceRow[col] + safeSurfaceWidth &&
      normCaveVal < primSurfaceBiome.airThreshold
    )
      return ["air", col, row];

    // Generate ores
    // TODO: Make them only spawn on rock, and not just in the air (Fixed, kinda)
    // TODO: Ores in caves should not be affected (atleast fully)
    // Make ore filters filter away ores in both biomes
    const activeOre = generateOre(
      relDepth,
      col,
      row,
      primSurfaceBiome.oreFilter
    );
    if (activeOre !== undefined) {
      if (relDepth > surfaceLevel) {
        const caveBiome = getUndergroundBiome(relDepth, col, row);
        if (normCaveVal < caveBiome.airThreshold) return ["air", col, row];
      }

      return [activeOre.material.name, col, row];
    }

    // Checks if surface or cave
    if (relDepth > surfaceLevel) {
      // UNDERGROUND
      const caveBiome = getUndergroundBiome(relDepth, col, row);

      if (normCaveVal < caveBiome.airThreshold) return ["air", col, row];
      // Accent blocks
      if (
        caveBiome.accent !== undefined &&
        caveBiome.accentChance !== undefined &&
        !perlinThreshold(
          undergroundAccentNoise[col][row],
          caveBiome.accentChance
        )
      )
        return [caveBiome.accent.name, col, row];

      return [caveBiome.wall.name, col, row];
    }

    // SURFACE
    if (row === surfaceRow[col]) return [activeSurfaceBiome.grass, col, row];

    return [activeSurfaceBiome.earth, col, row];
  }
);

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
      pos: { x: 0, y: 1400 },
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
