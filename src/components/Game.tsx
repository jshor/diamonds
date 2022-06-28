import { h, FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'
import { BlockType } from '../types'
import useStore from '../store'
import Matrix from './Matrix'

/**
 * The visual game state.
 *
 * @returns {FunctionComponent}
 */
const Game: FunctionComponent = (props) => {
  const loadLevel = useStore(state => state.loadLevel)
  const loadSoundEffects = useStore(state => state.loadSoundEffects)
  const onKeyDown = useStore(state => state.onKeyDown)
  const onKeyUp = useStore(state => state.onKeyUp)
  const loadGame = useStore(state => state.loadGame)
  const currentColor = useStore(state => state.currentColor)
  const borderColor = (BlockType[currentColor] || 'LightBlue')
    .toString()
    .replace('Brush', '')
    .toLowerCase()

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    loadLevel(0)
    loadSoundEffects()
  }, [])

  return (
    <div onClick={loadGame} style={{
      border: '5px solid gray',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '792px',
      height: '480px',
      boxShadow: '0 0 20px #fff',
      borderColor: `var(--${borderColor})`,
      backgroundImage: `url(${require('../assets/background.jpg')})`,
    }}>
      <Matrix />
      {props.children}
    </div>
  )
}

export default Game
