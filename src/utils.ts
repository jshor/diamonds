
import { BlockType, Point } from './types'
import Constants from './constants'

/**
 * Returns true if the ball having the given center coordinates collides with the block having the given position.
 *
 * @param {Point} ballCenter
 * @param {Point} block
 * @returns {boolean}
 */
function hasIntersection (ballCenter: Point, block: Point) {
  const width = Constants.BLOCK_WIDTH - 2 // minus 2 for two units of border on each side
  const height = Constants.BLOCK_HEIGHT - 2
  const cx = ballCenter.x
  const cy = ballCenter.y
  const cr = Constants.BALL_RADIUS
  const distX = Math.abs(cx - block.x + 1 - width / 2) // plus 1 for one unit of border
  const distY = Math.abs(cy - block.y + 1 - height / 2)

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
    const x = col * Constants.BLOCK_WIDTH
    const y = row * Constants.BLOCK_HEIGHT
    const intersects = hasIntersection(ballCenter, { x, y })

    if (intersects) {
      return matrix[col]?.[row] > 0
    }
  })
}
