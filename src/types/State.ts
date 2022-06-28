import BlockType from './BlockType'
import Point from './Point'
import Sound from './Sound'

type State = {
  position: Point
  hasSpawned: boolean
  isReversed: boolean
  verticalDirection: number
  horizontalDirection: number
  isLeftDown: boolean
  isRightDown: boolean
  paused: boolean
  currentBlock: number
  bonusTime: number
  currentColor: number
  hasKey: boolean
  ballCount: number
  blockCount: number
  diamondCount: number
  score: number
  currentLevelIndex: number
  currentLevelName: string
  matrix: BlockType[][]
  sounds: HTMLAudioElement[]
  music: HTMLAudioElement,
  msTimeElapsed: number
  msLastFrameTime: number
  notice: string

  loadGame: () => void
  pause: (notice?: string) => void
  play: () => void
  loadSoundEffects: () => void
  computeBonus: () => Promise<void>
  addToScore: (points: number) => void
  playSoundEffect: (sound: Sound) => void
  onKeyDown: ($event: KeyboardEvent) => void
  onKeyUp: ($event: KeyboardEvent) => void
  spawn: () => void
  die: () => void
  win: () => void
  loadLevel: (index: number) => void
  computeFrame: () => void
  applyBlockHit: (d: { row: number, col: number }, hasHitAboveOrLeft: boolean) => void
}

export default State
