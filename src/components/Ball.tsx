import { h } from 'preact'
import { BlockType } from '../types'
import { useEffect, useRef } from 'preact/hooks'
import useStore from '../store'
import Constants from '../constants'

/**
 * Represents the game ball.
 * It can either be static (standing still) or dynamic (moving around).
 *
 * @param {object} props
 * @param {boolean} [props.dynamic = false] - whether or not the ball is dynamic
 * @returns {FunctionComponent}
 */
const Ball = ({ dynamic = false }: { dynamic?: boolean }) => {
  const ball = useRef<HTMLDivElement>(null)
  const hasSpawned = useStore(state => state.hasSpawned)
  const color = dynamic
    ? useStore(state => state.currentColor)
    : BlockType.LightBlue
  const position = color === BlockType.LightBlue
    ? 0
    : BlockType.Purple - color

  useEffect(() => useStore.subscribe(
    state => {
      if (ball.current && dynamic) {
        ball.current.style.left = `${state.position.x}px`
        ball.current.style.top = `${state.position.y}px`
      }
    }
  ), [])

  return (
    <div
      ref={ball}
      style={{
        display: dynamic
          ? hasSpawned ? 'block' : 'none'
          : 'inline-block',
        position: dynamic ? 'absolute' : 'relative',
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundPosition: `0 ${position * Constants.BALL_DIAMETER}px`,
        backgroundImage: `url(${require('../assets/balls.png')})`
      }}
    />
  )
}

export default Ball
