
import { BlockType, Point } from './types'
import Constants from './constants'

/**
 * Returns true if the ball having the given center coordinates collides with the block having the given position.
 *
 * @param {Point} ballCenter
 * @param {number} col - column position in the matrix
 * @param {number} row - row position in the matrix
 * @returns {boolean}
 */
export function hasIntersection (ballCenter: Point, col: number, row: number) {
  const block = {
    x: col * Constants.BLOCK_WIDTH + 1,
    y: row * Constants.BLOCK_HEIGHT + 1
  }
  const width = Constants.BLOCK_WIDTH - 2 // minus 2 for two units of border on each side
  const height = Constants.BLOCK_HEIGHT - 2
  const cx = ballCenter.x
  const cy = ballCenter.y
  const cr = Constants.BALL_RADIUS
  const distX = Math.abs(cx - block.x - width / 2) // plus 1 for one unit of border
  const distY = Math.abs(cy - block.y - height / 2)

  if (distX > (width / 2 + cr)) return false
  if (distY > (height / 2 + cr)) return false
  if (distX <= (width / 2)) return true
  if (distY <= (height / 2)) return true

  const deltaX = distX - width / 2
  const deltaY = distY - height / 2

  return deltaX * deltaX + deltaY * deltaY <= cr * cr
}

/**
 * Finds a collision between the ball in the given cell coordinates and any of its 8 neighbors.
 *
 * @param {BlockType[][]} matrix - game adjacency matrix
 * @param {Point} ballCenter - the center point of the ball
 * @param {number} col - column position in the matrix
 * @param {number} row - row position in the matrix
 * @returns {object<{ col: number, row: number }>} position within the game matrix of the first colliding cell found (if any)
 */
export function findCollision (matrix: BlockType[][], ballCenter: Point, col: number, row: number) {
  // note: the order of the neighbor search must be preserved
  const neighbors = [
    // rows to the left or right
    { col, row: row - 1 },

    // rows adjacent
    { col: col - 1, row },
    { col: col + 1, row },
    { col, row: row + 1 },

    // rows above and below
    { col: col - 1, row: row - 1 },
    { col: col - 1, row: row + 1 },
    { col: col + 1, row: row + 1 },
    { col: col + 1, row: row - 1 },
  ]

  return neighbors.find(({ col, row }) => {
    if (hasIntersection(ballCenter, col, row)) {
      return matrix[col]?.[row] > 0 || col < 0 || row < 0
        || col >= 12 || row >= 12
    }
  })
}

/**
 * Returns true if the ball having the given center coordinates collides with a block in the next row of its travel direction.
 *
 * @param {Point} ballCenter
 * @param {number} direction - direction that the ball is traveling in
 * @returns {boolean}
 */
export function hasVerticalCollision (ballCenter: Point, direction: number) {
  // round to the nearest block vertical edge to determine which horizontal corner side was hit
  const round = (n: number, x: number) => Math.round(n / x) * x
  const colLeft = round(ballCenter.x - Constants.BALL_DIAMETER, Constants.BLOCK_WIDTH)
  const colRight = round(ballCenter.x + Constants.BALL_DIAMETER, Constants.BLOCK_WIDTH)
  const row = round(ballCenter.y, Constants.BLOCK_HEIGHT)
  const nextRow = row + direction

  return (colLeft < 0 || hasIntersection(ballCenter, colLeft, nextRow)) &&
    (colRight > Constants.BLOCK_WIDTH * 12 || hasIntersection(ballCenter, colRight, nextRow))
}
