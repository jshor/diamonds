import { h } from 'preact'
import { BlockType } from '../types'
import useStore from '../store'
import Block from './Block'

/**
 * The game matrix, displaying all cells.
 *
 * @returns {FunctionComponent}
 */
const Matrix = () => {
  const matrix = useStore((state) => state.matrix)
  const blocks: h.JSX.Element[] = []

  matrix.forEach((col, colIndex) => {
    col.forEach((row, rowIndex) => {
      if (row > BlockType.Space) {
        blocks.push(<Block
          blockType={matrix[colIndex][rowIndex]}
          col={colIndex}
          row={rowIndex}
        />)
      }
    })
  })

  return <div>{blocks}</div>
}

export default Matrix
