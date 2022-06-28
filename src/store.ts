import createStore from 'zustand'
import levels from './data/levels.json'
import { BlockType, Sound, State } from './types'
import { findCollision } from './utils'
import Constants from './constants'

export default createStore<State>((set, get) => ({
  position: {
    x: 0,
    y: 0
  },
  hasSpawned: false,
  isReversed: false,
  verticalDirection: 1,
  horizontalDirection: 0,
  isLeftDown: false,
  isRightDown: false,
  paused: true,
  currentBlock: -1,
  bonusTime: Constants.BONUS_INCREMENTS,
  currentColor: -1,
  hasKey: false,
  ballCount: 6,
  blockCount: 0,
  diamondCount: 0,
  score: 0,
  currentLevelIndex: 0,
  currentLevelName: '',
  matrix: [],
  sounds: [],
  music: new Audio(require('./audio/music.mp3')),
  msTimeElapsed: 0,
  msLastFrameTime: 0,
  notice: 'Click to begin',

  /**
   * Loads the game.
   */
  loadGame: () => {
    const { music, spawn } = get()

    music.play()
    music.loop = true
    spawn()
  },

  /**
   * Plays the sound corresponding to the value provided.
   *
   * @param {Sound} sound
   */
  playSoundEffect (sound: Sound) {
    const audio = get().sounds[sound]

    if (!audio) return
    if (audio.currentTime > 0) {
      audio.currentTime = 0
    }

    audio.play()
  },

  /**
   * Loads all audio sound effects.
   */
  loadSoundEffects () {
    const sounds: HTMLAudioElement[] = []
    const fileNames = [ // note: this must follow the order of Sound enum entries
      require('./audio/bounceDown.ogg'),
      require('./audio/bounceUp.ogg'),
      require('./audio/colorBlock.ogg'),
      require('./audio/colorChange.ogg'),
      require('./audio/diamond.ogg'),
      require('./audio/die.ogg'),
      require('./audio/laughter.ogg'),
      require('./audio/completed.ogg'),
      require('./audio/timeBonus.ogg'),
      require('./audio/key.ogg'),
      require('./audio/lock.ogg'),
      require('./audio/reverse.ogg'),
      require('./audio/oneUp.ogg')
    ]

    fileNames.forEach(fileName => {
      sounds.push(new Audio(fileName))
    })

    set({ sounds })
  },

  /**
   * Key down event handler.
   *
   * @param {KeyboardEvent} $event
   */
  onKeyDown: ($event: KeyboardEvent) => {
    const { paused, pause, play } = get()

    switch ($event.key) {
      case 'p':
      case 'P':
        return paused ? play() : pause('Paused')
      case 'ArrowLeft':
        return set({
          isLeftDown: true,
          isRightDown: false,
          horizontalDirection: 1
        })
      case 'ArrowRight':
        return set({
          isLeftDown: false,
          isRightDown: true,
          horizontalDirection: -1
        })
    }
  },

  /**
   * Key up event handler.
   *
   * @param {KeyboardEvent} $event
   */
  onKeyUp: ($event: KeyboardEvent) => {
    let {
      isLeftDown,
      isRightDown,
      horizontalDirection
    } = get()

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

    set({
      isLeftDown,
      isRightDown,
      horizontalDirection
    })
  },

  /**
   * Pauses the game with an optional notice message.
   *
   * @param {string} [notice = '']
   */
  pause: (notice = '') => {
    if (!get().paused) {
      set({ paused: true })
    }
    set({ notice })
  },

  /**
   * Plays the animation loop.
   */
  play: () => {
    const { computeFrame, paused } = get()

    if (paused) {
      set({
        paused: false,
        notice: ''
      })
      requestAnimationFrame(computeFrame.bind(this))
    }
  },

  /**
   * Spawns a new ball.
   */
  spawn: () => {
    const { hasSpawned, pause, play } = get()

    if (hasSpawned) return

    pause('Get ready')
    set({
      position: {
        x: Constants.BLOCK_WIDTH * 11,
        y: (Constants.BLOCK_HEIGHT * 12) - Constants.BALL_DIAMETER
      },
      isReversed: false,
      hasSpawned: true,
      currentColor: BlockType.LightBlue,
    })
    setTimeout(play, 1000)
  },

  /**
   * Handles a death of the ball.
   */
  die: () => {
    const { ballCount, pause, playSoundEffect, spawn, paused } = get()

    if (paused) return

    if (ballCount === 0) {
      pause('Game over')
      playSoundEffect(Sound.Laughter)
    } else {
      playSoundEffect(Sound.Death)
      set({
        ballCount: ballCount - 1,
        hasSpawned: false
      })
      setTimeout(spawn)
    }
  },

  /**
   * Wins a level.
   *
   * @returns {Promise<void>}
   */
  win: async () => {
    const { currentLevelIndex, computeBonus, loadLevel, pause, playSoundEffect, spawn } = get()

    playSoundEffect(Sound.Completed)

    pause('Completed!')

    await new Promise(r => setTimeout(r, 1000))
    await computeBonus()

    if (currentLevelIndex < levels.length - 1) {
      loadLevel(currentLevelIndex + 1)
      spawn()
    } else {
      pause('Congratulations, you won!')
    }
  },

  /**
   * Adds the given points to the current score.
   * This will trigger any side-effects from scoring (e.g., winning an extra ball).
   *
   * @param {number} points
   */
  addToScore: (points: number) => {
    const { ballCount, playSoundEffect, score } = get()
    const updatedScore = score + points
    const current = Math.floor(score / Constants.ADDITIONAL_BALL_SCORE)
    const next = Math.floor(updatedScore / Constants.ADDITIONAL_BALL_SCORE)

    if (next > current) {
      // user has won more balls
      set({
        score: updatedScore,
        ballCount: ballCount + (next - current)
      })
      playSoundEffect(Sound.OneUp)
    } else {
      set({ score: updatedScore })
    }
  },

  /**
   * Computes the bonus based on the given time blocks left (delaying 250ms per count).
   *
   * @returns {Promise<void>}
   */
  computeBonus: (): Promise<void> => {
    return new Promise(resolve => {
      function findRemainingTime () {
        const { bonusTime, playSoundEffect, score } = get()

        if (bonusTime > 0) {
          set({ bonusTime: bonusTime - 1 })
          get().addToScore(Constants.BONUS_VALUE_POINTS)
          playSoundEffect(Sound.TimeBonus)
          setTimeout(findRemainingTime, 250)
        } else {
          resolve()
        }
      }

      findRemainingTime()
    })
  },

  /**
   * Loads the level having the given index number.
   *
   * @param {number} currentLevelIndex
   */
  loadLevel: (currentLevelIndex: number) => {
    const { matrix, title } = levels[currentLevelIndex]

    let blockCount = 0
    let diamondCount = 0

    matrix.forEach(col => {
      col.forEach(block => {
        if (block >= BlockType.LightBlue && block <= BlockType.Purple) {
          blockCount++
        } else if (block === BlockType.Diamond) {
          diamondCount++
        }
      })
    })

    set({
      matrix,
      currentLevelIndex,
      currentLevelName: title,
      blockCount,
      diamondCount,
      msLastFrameTime: Date.now(),
      msTimeElapsed: 0,
      bonusTime: Constants.BONUS_INCREMENTS,
      currentBlock: -1,
      currentColor: -1,
      isLeftDown: false,
      isRightDown: false,
      hasKey: false,
      hasSpawned: false
    })
  },

  /**
   * Applies necessary side-effects of a ball hitting a block (e.g., playing sound effects, or increasing score).
   *
   * @param {object<{ row: number, col: number }>} entry - the position on the matrix of the block
   * @param {boolean} hasHitAboveOrLeft - whether or not the ball hit a block above or to the left of the one its currently in
   */
  applyBlockHit: ({ row, col }: { row: number, col: number }, hasHitAboveOrLeft: boolean) => {
    const {
      isReversed,
      matrix,
      currentColor,
      blockCount,
      diamondCount,
      hasKey,
      playSoundEffect,
      addToScore,
      win
    } = get()
    const block = matrix[col][row]

    const removeBlock = (col: number, row: number) => {
      matrix[col].splice(row, 1, BlockType.Space)
      set({ matrix: [...matrix] })
    }

    const playBounce = () => hasHitAboveOrLeft
      ? playSoundEffect(Sound.BounceUp)
      : playSoundEffect(Sound.BounceDown)

    if (block >= BlockType.LightBlue && block <= BlockType.Purple) {
      // check the color (the color order starts at BrushBlue, plus one to skip LightBlue)
      if ((currentColor === BlockType.LightBlue && block === BlockType.LightBlue) || currentColor - 5 === block) {
        // color matches the block; consume it
        removeBlock(col, row)
        set({ blockCount: blockCount - 1 })
        addToScore(Constants.BLOCK_SCORE)
        playSoundEffect(Sound.ColorBlock)
      } else {
        playBounce()
      }
    } else if (block >= BlockType.BrushBlue && block <= BlockType.BrushOrange && block !== currentColor) {
      set({ currentColor: block })
      playSoundEffect(Sound.ColorChange)
    } else if (block === BlockType.Diamond && blockCount === 0) {
      removeBlock(col, row)
      set({ diamondCount: diamondCount - 1 })
      addToScore(Constants.DIAMOND_SCORE)
      playSoundEffect(Sound.Diamond)
    } else if (block === BlockType.Key && currentColor === BlockType.BrushOrange && !hasKey) {
      removeBlock(col, row)
      set({ hasKey: true })
      addToScore(Constants.KEY_SCORE)
      playSoundEffect(Sound.Key)
    } else if (block === BlockType.Lock && currentColor === BlockType.BrushOrange && hasKey) {
      removeBlock(col, row)
      set({ hasKey: false })
      addToScore(Constants.LOCK_SCORE)
      playSoundEffect(Sound.Lock)
    } else if (block === BlockType.Reverse) {
      removeBlock(col, row)
      set({ isReversed: !isReversed })
      playSoundEffect(Sound.Reverse)
    } else {
      playBounce()
    }

    if (get().diamondCount === 0) {
      win()
    }
  },

  /**
   * Computes the next animation frame.
   */
   computeFrame: () => {
    const width = Constants.BLOCK_WIDTH * 12
    const height = Constants.BLOCK_HEIGHT * 12
    const {
      currentBlock,
      horizontalDirection,
      verticalDirection,
      isReversed,
      position,
      matrix,
      paused,
      msLastFrameTime,
      msTimeElapsed,
      playSoundEffect,
      computeFrame
    } = get()

    let nextX = position.x
    let nextY = position.y
    let nextVerticalDirection = verticalDirection

    if (currentBlock === -1) {
      // initial position
      set({ currentBlock: BlockType.Space })
    }

    if (horizontalDirection === (isReversed ? -1 : 1)) {
      // going left
      nextX -= Constants.BALL_SPEED
    } else if (horizontalDirection === (isReversed ? 1 : -1)) {
      // going right
      nextX += Constants.BALL_SPEED
    }

    if (nextVerticalDirection === 1) {
      // going up
      if (nextY <= 0) {
        nextY = 0
        nextVerticalDirection = -1
        playSoundEffect(Sound.BounceDown)
      } else {
        nextY -= Constants.BALL_SPEED
      }
    } else {
      // going down
      if (nextY + Constants.BALL_DIAMETER >= height) {
        nextVerticalDirection = 1
        nextY = height - Constants.BALL_DIAMETER
        playSoundEffect(Sound.BounceUp)
      } else {
        nextY += Constants.BALL_SPEED
      }
    }

    if (nextX < 0) {
      // bounce off left
      nextX = Constants.BOUNCE_AMOUNT
      playSoundEffect(Sound.BounceDown)
    } else if (position.x + Constants.BALL_DIAMETER > width) {
      // bounce off right
      nextX = width - Constants.BALL_DIAMETER - Constants.BOUNCE_AMOUNT
      playSoundEffect(Sound.BounceDown)
    } else {
      // detect any collisions with blocks
      const ballCenter = {
        x: nextX + Constants.BALL_RADIUS,
        y: nextY + Constants.BALL_RADIUS
      }
      // determine which column/row the ball is currently in
      const col = Math.floor(ballCenter.x / Constants.BLOCK_WIDTH)
      const row = Math.floor(ballCenter.y / Constants.BLOCK_HEIGHT)
      const collision = findCollision(matrix, ballCenter, col, row)

      if (collision) {
        if (matrix[collision.col][collision.row] === BlockType.Death) {
          get().die()
        } else {
          get().applyBlockHit(collision, collision.col > col || collision.row > row)

          if (collision.col !== col) {
            nextX = collision.col > col
              ? (collision.col * Constants.BLOCK_WIDTH) - Constants.BALL_DIAMETER - Constants.BOUNCE_AMOUNT // collision to the left
              : (collision.col + 1) * Constants.BLOCK_WIDTH + Constants.BOUNCE_AMOUNT // collision to the right
          }

          if (collision.row !== row) {
            nextY = collision.row > row
              ? (collision.row * Constants.BLOCK_HEIGHT) - Constants.BALL_DIAMETER // collision above (no bouncing)
              : (collision.row + 1) * Constants.BLOCK_HEIGHT + Constants.BOUNCE_AMOUNT // collision below (+ bounce)

            nextVerticalDirection = nextVerticalDirection === -1 ? 1 : -1
          }
        }
      }
    }

    const now = Date.now()
    const elapsed = msTimeElapsed + (now - msLastFrameTime)

    set({
      position: {
        x: nextX,
        y: nextY
      },
      verticalDirection: nextVerticalDirection,
      msTimeElapsed: elapsed,
      msLastFrameTime: now,
      bonusTime: Math.max(Math.ceil(
        (1 - (elapsed / (Constants.BONUS_INCREMENTS * Constants.BONUS_TIME_MS))) * Constants.BONUS_INCREMENTS
      ), 0)
    })

    if (!paused) {
      requestAnimationFrame(computeFrame.bind(this))
    }
  }
}))
