import { h } from 'preact'
import useStore from '../store'
import Ball from './Ball'
import Bonus from './Bonus'
import Key from './Key'

/**
 * A stats bar heading.
 *
 * @param {object} props
 * @param {string} props.title - heading title
 * @returns {FunctionComponent}
 */
const Heading = ({ text }: { text: string }) => (
  <div style={{ marginBottom: '0.25em' }}>{text}</div>
)

/**
 * The game stats bar.
 *
 * @returns {FunctionComponent}
 */
const Stats = () => {
  const currentLevelIndex = useStore(state => state.currentLevelIndex)
  const currentLevelName = useStore(state => state.currentLevelName)
  const ballCount = useStore(state => state.ballCount)
  const hasKey = useStore(state => state.hasKey)
  const score = useStore(state => state.score)
    .toString()
    .padStart(6, '0')
  const balls = Array(ballCount).fill(<Ball />)

  return (
    <div style={{
      backgroundColor: '#797778',
      width: 792,
      marginTop: '0.5em',
      display: 'flex',
      padding: '0.25em'
    }}>
      <div style={{ flex: 1 }}>
        <Heading text="Score" />
        <div style={{ fontSize: '1.5em' }}>
          {score}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Heading text={`Level: ${currentLevelIndex + 1}`} />
        <div style={{ fontSize: '1.25em' }}>
          {currentLevelName}
        </div>
      </div>
      <div style={{ width: 80 }}>
        Key
        <Key active={hasKey} />
      </div>
      <div style={{ flex: 1 }}>
        Bonus
        <Bonus />
      </div>
      <div style={{ flex: 1 }}>
        <Heading text={`Balls: ${ballCount}`} />
        <div>{balls}</div>
      </div>
    </div>
  )
}

export default Stats
