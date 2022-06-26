
export enum Sound {
  BounceDown = 0,
  BounceUp,
  ColorBlock,
  ColorChange,
  Diamond,
  Death,
  Laughter,
  Completed,
  TimeBonus,
  Key,
  Lock,
  Reverse
}

let isPlayingMusic = false

const sounds: HTMLAudioElement[] = []
const music = new Audio(require('./audio/music.mp3'))

music.loop = true

function loadAudio () {
  const fileNames = [
    require(`./audio/bounce.ogg`),
    require(`./audio/bounce2.ogg`),
    require(`./audio/colorblock.ogg`),
    require(`./audio/colorchange.ogg`),
    require(`./audio/diamond.ogg`),
    require(`./audio/die.ogg`),
    require(`./audio/laughter.ogg`),
    require(`./audio/levelwon.ogg`),
    require(`./audio/timebonus.ogg`),
    require(`./audio/key.ogg`),
    require(`./audio/lock.ogg`),
    require(`./audio/reverse.ogg`)
  ]

  fileNames.forEach(fileName => {
    sounds.push(new Audio(fileName))
  })
}

function play (sound: Sound) {
  const audio = sounds[sound]

  if (!audio) return
  if (audio.currentTime > 0) {
    audio.currentTime = 0
  }

  audio.play()
}

function startMusic () {
  if (!isPlayingMusic) {
    isPlayingMusic = true
    music.play()
  }
}

export default {
  loadAudio,
  play,
  startMusic
}
