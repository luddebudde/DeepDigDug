
import { vectorFromAngle } from './angle'
import { Vec2 } from './vec'

export const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export const randomUnitVector = (): Vec2 =>
  vectorFromAngle(Math.random() * 2 * Math.PI)