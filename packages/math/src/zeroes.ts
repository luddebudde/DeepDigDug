export const zeros = (n: number): number[] => Array(n).fill(0)

export const zeros2 = (width: number, height: number): number[][] =>
  zeros(width).map(() => zeros(height))