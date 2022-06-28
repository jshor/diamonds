import { h } from 'preact'
import useStore from '../store'

/**
 * The visual notice that appears in the center of the game when paused.
 *
 * @returns {FunctionComponent}
 */
const Notice = () => {
  const notice = useStore(state => state.notice)

  if (!notice) return <div />

  return (
    <div style={{
      backgroundColor: '#797778',
      fontWeight: 'bold',
      fontSize: '2em',
      zIndex: 9999,
      padding: '0.25em',
      border: '1px solid black'
    }}>
      {notice}
    </div>
  )
}

export default Notice
