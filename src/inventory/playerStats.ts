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
    power: 100,
    speed: cooldownPerSecond,
    cooldown: 0,
  },
  movement: {
    onGround: false,
    walk: {
      strength: 50,
    },
    jump: {
      strength: 1000,
      cooldown: 10,
    },
  },
};
