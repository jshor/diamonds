export const classes = `
lightblue
blue
red
green
brown
purple
brush-blue
brush-red
brush-green
brush-brown
brush-purple
brush-orange
diamond
key
lock
brick
death
reverse
`.split('\n')

// # l(ight blue), b(lue), r(ed), g(reen), (bro)w(n), p(urple) =  color blocks
// # B(lue), R(ed), G(reen), (bro)W(n), P(urple), O(range) =  color brushes
// # d(iamond), s(kull), k(ey), L(ock), S(olid), (re)v(erse), n(ull)

const letters = 'nlbrgwpBRGWPOdkLSsv'.split('')

// name=Simpleton
const data = `
snnnnwwnnnns
SnnnSggSnnnS
nnndggggdnnn
nWdbbbbbbdBn
nSllnnnnllSn
nnnnnddnnnnn
nnnnnddnnnnn
nSllnnnnllSn
nGdggggggdPn
nnndbbbbdnnn
nnnnSbbSnnnn
nnnnnppnnnnn
`

const matrix = Array(12)
  .fill([])
  .map(() => Array(12).fill(0))

data
  .trim()
  .split('\n')
  .forEach((line, row) => {
    line
      .trim()
      .split('')
      .forEach((letter, col) => {
        matrix[col][row] = letters.indexOf(letter)
      })
  })

export default matrix
