import { Chunk, createChunk } from "./createChunk";
import { terrain } from "@repo/world-generation";
import { getMaterialId } from "../packages/world-generation/src/materials";

export const generateWorld = async (): Promise<Chunk[][]> => {
  const chunks: Chunk[][] = [[]];

  terrain.flat().forEach(([materialKey, column, row]) => {
    const materialId = getMaterialId(materialKey);
    createChunk(chunks, { row, column }, materialId);
  });

  console.log(chunks);

  return chunks;
};
