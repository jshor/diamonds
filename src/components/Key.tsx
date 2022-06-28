import { h } from 'preact'

/**
 * The key that displays in the stats bar.
 *
 * @param {object} props
 * @param {boolean} props.active - whether or not the key appears active (translucent otherwise)
 * @returns {FunctionComponent}
 */
const Key = ({ active }: { active: boolean }) => <div style={{
  width: 38,
  height: 22,
  margin: '0.25em 0',
  backgroundImage: `url(${require('../assets/key.png')})`,
  filter: (active ? '' : 'grayscale(100%) ') + 'drop-shadow(1px 1px 1px black)',
  opacity: active ? 1 : 0.5
}} />

export default Key
