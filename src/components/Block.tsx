import { h } from 'preact'
import { BlockType } from '../types'
import Constants from '../constants'

/**
 * Represents a block cell (e.g., brick, color block, death, etc.)
 *
 * @param {object} props
 * @param {BlockType} props.blockType - block type of the cell
 * @param {number} props.col - column index within the matrix
 * @param {number} props.row - row index within the matrix
 * @returns {FunctionComponent}
 */
const Block = ({ blockType, col, row }: { blockType: BlockType, col: number, row: number }) => {
  const position = (BlockType.Reverse - blockType + 1)

  return (
    <div style={{
      display: 'block',
      position: 'absolute',
      boxSizing: 'border-box',
      width: '66px',
      height: '40px',
      backgroundImage: `url(${require('../assets/blocks.png')})`,
      backgroundPosition: `0 ${position * Constants.BLOCK_HEIGHT}px`,
      top: row * Constants.BLOCK_HEIGHT,
      left: col * Constants.BLOCK_WIDTH
    }} />
  )
}

export default Block
