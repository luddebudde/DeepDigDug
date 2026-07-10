import { cooldownPerSecond } from "./updateCooldown";

export type PlayerStats = {
  mining: {
    power: number;
    speed: number;
    cooldown: number;
  };
  movement: {
    onGround: boolean;
    walk: {
      strength: number;
    };
    jump: {
      strength: number;
      cooldown: number;
    };
  };
};

export const playerStats = {
  mining: {
    power: 34,
    speed: cooldownPerSecond,
    cooldown: 0,
  },
  movement: {
    onGround: false,
    walk: {
      strength: 100,
    },
    jump: {
      strength: 750,
      cooldown: 10,
    },
  },
};
