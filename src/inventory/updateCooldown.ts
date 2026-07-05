export const cooldownPerSecond = 10;

export const updateCooldown = (dt: number, stat: number) =>
  (stat = Math.max(stat - cooldownPerSecond * dt, 0));
