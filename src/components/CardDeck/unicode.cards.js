const cache = {}
const SUITS = {
  S: 'A',
  H: 'B',
  D: 'C',
  C: 'D',
  UNICODE: {
    OUTLINE: {
      S: '\u2664',
      H: '\u2661',
      D: '\u2662',
      C: '\u2667',
    },
    BLACK: {
      S: '\u2660',
      H: '\u2665',
      D: '\u2666',
      C: '\u2663',
    },
  },
}

function reduceFnTallyBase16(n, acc = {}) {
  const { pow = 1, total = 0 } = acc
  acc.total += Math.pow(+`0x${n}`, pow)
  acc.pow += 1

  return acc
}

const VALUES = [
  '', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'C', 'Q', 'K'
]

/**
 * Get the unicode character for a suit
 */
function suitToUnicode(suit, outline = false) {
  const chars = SUITS.UNICODE[outline ? 'OUTLINE' : 'BLACK']
  return chars[`${suit}`.toUpperCase()]
}

/**
 * Get the unicode character for a suited playing card
 */
function cardToUnicode(value, suit) {
  // Get the portion of unicode suit and value represent
  const suitPoint = SUITS[`${suit}`.toUpperCase()]
  const valPoint = VALUES.indexOf(`${value}`.toUpperCase())
  // If suit not valid, just return the suits unicode
  if (valPoint < 1) { return suitToUnicode(suit) }
  // Return the unicode value of playing card
  const unicodeValue = `1F0${suitPoint}${valPoint.toString(16)}`
  return eval(`'\\u{${unicodeValue}}'`)
}

/**
 * Memoized version of the 'cardToUnicode' function above
 */
function playingCardToUnicode(value, suit) {
  const key = `${value}${suit}`.toUpperCase()
  if (!(key in cache)) {
    cache[key] = cardToUnicode(value, suit)
  }

  return cache[key]
}

export default playingCardToUnicode
