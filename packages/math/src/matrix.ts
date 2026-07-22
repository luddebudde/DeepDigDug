export const mapMat = <A, B>(
  matrix: A[][],
  map: (it: A, column: number, row: number) => B,
): B[][] =>
  matrix.map((cells, column) =>
    cells.map((cell, row) => map(cell, column, row)),
  )

export const mapMat2 = <A, B, C>(
  matA: A[][],
  matB: B[][],
  map: (a: A, b: B, column: number, row: number) => C,
): C[][] => mapMat(matA, (a, x, y) => map(a, matB[x][y], x, y))

export const addMat = (matA: number[][], matB: number[][]): number[][] =>
  mapMat2(matA, matB, (a, b) => a + b)
export const subMat = (matA: number[][], matB: number[][]): number[][] =>
  mapMat2(matA, matB, (a, b) => a - b)

export const multMat = (matA: number[][], matB: number[][]): number[][] =>
  mapMat2(matA, matB, (a, b) => a * b)

export const divMat = (matA: number[][], matB: number[][]): number[][] =>
  mapMat2(matA, matB, (a, b) => a / b)

export const scaleMat = (matA: number[][], scalar: number): number[][] =>
  mapMat(matA, (a) => a * scalar)