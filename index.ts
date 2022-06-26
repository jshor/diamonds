import './styles.css'
import { classes } from './data'
import audio, { Sound } from './audio'
import levels from './levels.json'

const level = 0

enum BlockType {
  Space = 0,
  LightBlue,
  Blue,
  Red,
  Green,
  Brown,
  Purple,
  BrushBlue,
  BrushRed,
  BrushGreen,
  BrushBrown,
  BrushPurple,
  BrushOrange,
  Diamond,
  Key,
  Lock,
  Brick,
  Death,
  Reverse
}

const speed = 4.7
// const speed = 4
let isReversed = false
let verticalDirection = 1
let horizontalDirection = 0
let isLeftDown = false
let isRightDown = false
let paused = true
let currentBlock = -1
let bonusTime = 46

let currentColor = -1
let hasKey = false
let ballCount = 0

type Point = { x: number, y: number }

const BLOCK_WIDTH = 66
const BLOCK_HEIGHT = 40
const BALL_DIAMETER = 20
const BALL_RADIUS = BALL_DIAMETER / 2
const TIME_BONUS = 25
const DIAMOND_SCORE = 100
const BLOCK_SCORE = 3
const KEY_SCORE = 25
const LOCK_SCORE = 50
const ADDITIONAL_BALL_SCORE = 5000

const position = { x: 0, y: 0 }

const bounceAmount = BALL_DIAMETER

let matrix: number[][] = []

let blockCount = 0
let diamondCount = 0
let score = 0
let bonusTimeout = 0
let currentLevel = 29

audio.loadAudio()

function clearDOMBlocks () {
  document
    .querySelectorAll('.block')
    .forEach(el => el.remove())
}

function loadLevel () {
  const data = levels[currentLevel]

  matrix = data.matrix

  pause()
  clearDOMBlocks()
  setKey(false)

  audio.startMusic()

  const levelNumber = document.getElementById('levelNumber') as HTMLElement
  const levelName = document.getElementById('levelName') as HTMLElement

  levelName.innerHTML = data.title
  levelNumber.innerHTML = (currentLevel + 1).toString()

  const game = document.getElementById('game') as HTMLElement

  matrix.forEach((col, colIndex) => {
    col.forEach((row, rowIndex) => {
      if (row > BlockType.Space) {
        const el = document.createElement('div')

        el.className = `block block--${classes[row]}`
        el.style.left = `${colIndex * BLOCK_WIDTH}px`
        el.style.top = `${rowIndex * BLOCK_HEIGHT}px`
        el.dataset.block = `col_${colIndex}_row_${rowIndex}`

        if (row >= BlockType.LightBlue && row <= BlockType.Purple) {
          blockCount++
        } else if (row === BlockType.Diamond) {
          diamondCount++
        }

        game.prepend(el)
      }
    })
  })

  bonusTime = 46
  spawn()
}

function spawn () {

  position.x = BLOCK_WIDTH * 11,
  position.y = (BLOCK_HEIGHT * 12) - BALL_DIAMETER
  isReversed = false

  animate()
  pause()
  notice('Get ready')
  renderBonus(bonusTime)
  setTimeout(() => {
    changeColor(BlockType.LightBlue)
    notice()
    unpause()
    decreaseBonusTime()
  }, 1000)

}

function die () {
  if (ballCount === 0) {
    pause()
    audio.play(Sound.Laughter)
    notice('Game over')
  } else {
    audio.play(Sound.Death)
    renderBalls(-1)
    spawn()
  }
}

function animate () {
  const ball = document.getElementById('ball') as HTMLElement
  const width = BLOCK_WIDTH * 12
  const height = BLOCK_HEIGHT * 12

  if (currentBlock === -1) {
    // initial position
    currentBlock = 0
  }

  if (horizontalDirection === (isReversed ? -1 : 1)) {
    // going left
    position.x -= speed
  } else if (horizontalDirection === (isReversed ? 1 : -1)) {
    // going right
    position.x += speed
  }

  if (verticalDirection === 1) {
    // going up
    if (position.y <= 0) {
      position.y = 0
      verticalDirection = -1
      audio.play(Sound.BounceDown)
    } else {
      position.y -= speed
    }
  } else {
    // going down
    if (position.y + BALL_DIAMETER >= height) {
      position.y = height - BALL_DIAMETER
      verticalDirection = 1
      audio.play(Sound.BounceUp)
    } else {
      position.y += speed
    }
  }

  if (position.x < 0) {
    // bounce off left
    position.x = speed
    audio.play(Sound.BounceDown)
  } else if (position.x + BALL_DIAMETER > 12 * BLOCK_WIDTH) {
    // bounce off right
    position.x = (12 * BLOCK_WIDTH) - BALL_DIAMETER - bounceAmount
    audio.play(Sound.BounceDown)
  } else {
    checkAdjacentBlocks(position)
  }

  ball.style.left = `${position.x}px`
  ball.style.top = `${position.y}px`

  if (!paused) {
    requestAnimationFrame(animate)
  }
}

const hasIntersection = (ball: Point, block: Point) => {
  const width = BLOCK_WIDTH - 2 // minus 2 for two units of border on each side
  const height = BLOCK_HEIGHT - 2
  const cx = ball.x + BALL_RADIUS
  const cy = ball.y + BALL_RADIUS
  const cr = BALL_RADIUS
  const distX = Math.abs(cx - block.x + 1 - width / 2); // plus 1 for one unit of border
  const distY = Math.abs(cy - block.y + 1 - height / 2);

  if (distX > (width / 2 + cr)) {
    return false;
  }
  if (distY > (height / 2 + cr)) {
    return false;
  }

  if (distX <= (width / 2)) {
    return true;
  }
  if (distY <= (height / 2)) {
    return true;
  }

  const Δx = distX - width / 2;
  const Δy = distY - height / 2;
  return Δx * Δx + Δy * Δy <= cr * cr;
}

function checkAdjacentBlocks (position: Point) {
  // check for collisions
  const hits: { row: number, col: number }[] = []

  const ballCenter = {
    x: position.x + BALL_RADIUS,
    y: position.y + BALL_RADIUS
  }

  const col = Math.floor(ballCenter.x / BLOCK_WIDTH)
  const row = Math.floor(ballCenter.y / BLOCK_HEIGHT)

  const neighbors = [
    // above
    { col, row: row - 1 },

    // next to
    { col: col - 1, row },
    { col: col + 1, row },
    { col, row: row + 1 },

    // below
    { col: col - 1, row: row - 1 },
    { col: col - 1, row: row + 1 },
    { col: col + 1, row: row + 1 },
    { col: col + 1, row: row - 1 },
  ]

  const result = neighbors.find(({ col, row }) => {
    const x = col * BLOCK_WIDTH
    const y = row * BLOCK_HEIGHT
    const intersects = hasIntersection(position, { x, y })

    if (intersects) {
      return matrix[col]?.[row] > 0
    }
  })

  if (result) {
    if (matrix[result.col][result.row] === BlockType.Death) {
      die()
    } else {
      applyBlockHit(result, result.col > col || result.row > row)

      if (result.col !== col) {
        position.x = result.col > col
          ? (result.col * BLOCK_WIDTH) - BALL_DIAMETER - bounceAmount // TODO: bounce?
          : (result.col + 1) * BLOCK_WIDTH + bounceAmount
      }

      if (result.row !== row) {
        position.y = result.row > row
          ? (result.row * BLOCK_HEIGHT) - BALL_DIAMETER - bounceAmount // hit above
          : (result.row + 1) * BLOCK_HEIGHT + bounceAmount // hit below

          verticalDirection = verticalDirection === -1 ? 1 : -1
      }
    }
  }

  return hits
}

function applyBlockHit ({ row, col }: { row: number, col: number }, hasHitAboveOrLeft: boolean) {
  const block = matrix[col][row]

  function playBounce () {
    hasHitAboveOrLeft
      ? audio.play(Sound.BounceUp)
      : audio.play(Sound.BounceDown)
  }

  if (block >= BlockType.LightBlue && block <= BlockType.Purple) {
    // check the color (the color order starts at BrushBlue, plus one to skip LightBlue)
    if ((currentColor === BlockType.LightBlue && block === BlockType.LightBlue) || currentColor - 5 === block) {
      // color matches the block; consume it
      removeBlock(col, row)
      updateScore(BLOCK_SCORE)
      audio.play(Sound.ColorBlock)
      blockCount--
    } else {
      playBounce()
    }
  } else if (block >= BlockType.BrushBlue && block <= BlockType.BrushOrange && block !== currentColor) {
    changeColor(block)
    audio.play(Sound.ColorChange)
  } else if (block === BlockType.Diamond && blockCount === 0) {
    removeBlock(col, row)
    updateScore(DIAMOND_SCORE)
    audio.play(Sound.Diamond)
    diamondCount--
  } else if (block === BlockType.Key && currentColor === BlockType.BrushOrange && !hasKey) {
    removeBlock(col, row)
    updateScore(KEY_SCORE)
    audio.play(Sound.Key)
    setKey(true)
  } else if (block === BlockType.Lock && currentColor === BlockType.BrushOrange && hasKey) {
    removeBlock(col, row)
    updateScore(LOCK_SCORE)
    audio.play(Sound.Lock)
    setKey(false)
  } else if (block === BlockType.Reverse) {
    removeBlock(col, row)
    isReversed = !isReversed
    audio.play(Sound.Reverse)
  } else {
    playBounce()
  }

  if (diamondCount === 0) {
    audio.play(Sound.Completed)
    paused = true
    notice('Level cleared')

    setTimeout(() => {
      winLevel()
    }, 1000)
  }
}

function notice (text?: string) {
  const notice = document.getElementById('notice') as HTMLElement

  notice.className = text
    ? 'notice notice--visible'
    : 'notice notice--hidden'

  notice.innerHTML = text || ''
}

function changeColor (newColor: BlockType) {
  const ball = document.getElementById('ball') as HTMLElement
  const game = document.getElementById('game') as HTMLElement
  const color = classes[newColor].replace('brush-', '')

  ball.className = `ball ball--${color}`
  game.className = `game game--${color}`

  currentColor = newColor
}

function removeBlock (col: number, row: number) {
  const el = document.querySelector(`[data-block="col_${col}_row_${row}"]`)

  matrix[col][row] = 0

  if (el) {
    el.className = 'block block--space'
  }
}

function unpause () {
  if (paused) {
    paused = false
    requestAnimationFrame(animate)
  }
}

function pause () {
  if (!paused) {
    clearTimeout(bonusTimeout)
    paused = true
  }
}

function onKeyDown ($event: KeyboardEvent) {
  switch ($event.key) {
    case 'ArrowLeft':
      isLeftDown = true
      horizontalDirection = 1
      break
    case 'ArrowRight':
      isRightDown = true
      horizontalDirection = -1
      break
  }
}

function onKeyUp ($event: KeyboardEvent) {
  switch ($event.key) {
    case 'ArrowLeft':
      isLeftDown = false
      break
    case 'ArrowRight':
      isRightDown = false
      break
  }

  if (!isLeftDown && !isRightDown) {
    horizontalDirection = 0
  }
}

function setKey (_hasKey: boolean) {
  const key = document.getElementById('key') as HTMLElement

  key.className = 'stats__key stats__key--'
  key.className += _hasKey ? 'active' : 'inactive'

  hasKey = _hasKey
}

function decreaseBonusTime () {
  renderBonus(bonusTime--)

  bonusTimeout = setTimeout(() => {
    if (bonusTime > 0) {
      decreaseBonusTime()
    }
  }, 1250)
}

function winLevel () {
  if (bonusTime > 0) {
    updateScore(TIME_BONUS)
    renderBonus(bonusTime--)
    audio.play(Sound.TimeBonus)
  }

  setTimeout(() => {
    if (bonusTime > 0) {
      winLevel()
    } else {
      currentLevel++
      loadLevel()
    }
  }, 250)
}

function updateScore (count: number) {
  const scoreEl = document.getElementById('score') as HTMLElement

  score += count

  // TODO: add more balls depending on score

  const s: any = score.toString()

  const displayScore = s.padStart(6, '0')
  scoreEl.innerHTML = displayScore
}

function renderBalls (count: number) {
  const balls = document.getElementById('balls') as HTMLElement
  const countBalls = document.getElementById('ballCount') as HTMLElement

  ballCount += count
  balls.innerHTML = ''
  countBalls.innerHTML = ballCount.toString()

  for (let i = 0; i < ballCount; i++) {
    const ball = document.createElement('div')

    ball.className = 'ball ball--busted'

    balls.appendChild(ball)
  }
}

function renderBonus (count: number) {
  const bonus = document.getElementById('bonus') as HTMLElement

  bonus.innerHTML = ''

  for (let i = 0; i < 46; i++) {
    const b = document.createElement('div')
    let className = 'bonus'

    if (count) {
      count--
      className += ' bonus--active'
    }

    b.className = className

    bonus.appendChild(b)
  }
}

updateScore(0)
renderBonus(46)
renderBalls(6)

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)
document.getElementById('unpause')?.addEventListener('click', loadLevel)
