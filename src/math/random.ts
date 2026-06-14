
import { vectorFromAngle } from './angle.ts'

export const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export const randomUnitVector = (): Vector =>
  vectorFromAngle(Math.random() * 2 * Math.PI)