import { changeBlock, findBlock, findChunk, Integer } from "./findWorldBlocks";
import { addToInventory } from "./inventory/addToInventory";
import { PlayerStats } from "./inventory/playerStats";
import { Vec2 } from "./math/vec";
import { Chunk } from "./world_generation/createChunk";
import { getMaterial } from "./world_generation/materials";

// Refactor to another file
export const getOrCreate = <T>(
  array: T[],
  key: keyof T,
  value: T[keyof T],
  newItem: T
): T => {
  let item = array.find((item) => item[key] === value);
  if (!item) {
    item = newItem;
    array.push(newItem);
  }
  return item;
};

export const mineBlock = (
  chunks: Chunk[][],
  mouseWorldPos: Vec2,
  playerStats: PlayerStats
) => {
  const pos = mouseWorldPos;
  const chunk = findChunk(pos, chunks);
  if (!chunk) return;
  const [idx, materialInt] = findBlock(pos, chunk);

  // console.log(chunk);

  const block = getOrCreate(chunk.damagedBlocks, "idx", idx, {
    idx,
    materialInt,
    durability: 100,
  });

  block.durability -= playerStats.mining.power;

  if (block.durability >= 0) {
    breakBlock(chunk, idx, materialInt);
  }
  chunk.renderdChange = true;
};

const breakBlock = (chunk: Chunk, blockIdx: number, materialInt: Integer) => {
  // AddToInventory() should be placed inside a pickUp() function instead
  addToInventory(materialInt, 1);
  changeBlock(chunk.blocks, blockIdx, "air");
};
