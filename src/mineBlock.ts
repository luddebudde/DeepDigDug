import { changeBlock, findBlock, findChunk } from "./findWorldBlocks";
import { invenstory as inventory } from "./inventory/inventory";
import { PlayerStats } from "./inventory/playerStats";
import { Vec2 } from "./math/vec";
import { Chunk } from "./world_generation/createChunk";

// Refactor to another file
function getOrCreate<T>(
  array: T[],
  key: keyof T,
  value: T[keyof T],
  newItem: T
): T {
  let item = array.find((item) => item[key] === value);
  if (!item) {
    item = newItem;
    array.push(newItem);
  }
  return item;
}

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
    inventory.inventory.push(materialInt);
    changeBlock(chunk.blocks, idx, "air");
  }
  chunk.renderdChange = true;
};

const breakBlock = (chunk: Chunk, blockIdx: number) => {
  //console.log(chunk.blocks);
};
