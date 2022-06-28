import { h } from 'preact'
import Ball from './components/Ball'
import Game from './components/Game'
import Notice from './components/Notice'
import Stats from './components/Stats'
import './styles.css'

const App = () => {
  return (
    <div>
      <Game>
        <Ball dynamic />
        <Notice />
      </Game>
      <Stats />
    </div>
  )
}

export default App
