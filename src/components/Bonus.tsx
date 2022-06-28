import { h } from 'preact'
import useStore from '../store'

/**
 * A time bar.
 *
 * @param {object} props
 * @param {boolean} props.active - whether or not the bar appears active (bright red) vs inactive (dark red)
 * @returns {FunctionComponent}
 */
const TimeBar = ({ active }: { active?: boolean }) => {
  return <div style={{
    backgroundColor: active ? 'red' : 'darkred',
    width: 5,
    height: 10,
    marginTop: 2
  }} />
}

/**
 * The time bonus bar list in the stats.
 * @returns
 */
const Bonus = () => {
  const bonusTime = useStore(state => state.bonusTime)
  const createBars = (n: number, active: boolean) => {
    return Array(n).fill(<TimeBar active={active} />)
  }

  return (
    <div style={{
      marginTop: '0.25em',
      marginRight: '0.5em',
      maxWidth: 160,
      display: 'grid',
      gridTemplateColumns: 'repeat(23, 1fr)',
      gridGap: 2
    }}>
      {createBars(bonusTime, true)}
      {createBars(46 - bonusTime, false)}
    </div>
  )
}

export default Bonus
