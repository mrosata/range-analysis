import memoize from 'ramda/src/memoize'
const SUITED = 4;
const PAIR = 6;
const OFFSUIT = 12;

export const CARDS = Object.freeze([
  'A','K','Q','J','T','9','8','7','6','5','4','3','2'
]);
export const SUITS = {
  H: 0b1000,
  h: 0b1000,
  S: 0b0100,
  s: 0b0100,
  C: 0b0010,
  c: 0b0010,
  D: 0b0001,
  d: 0b0001,
};

export const REMAINING_SUITS = {
  hscd: 0b1111,
  hsc_: 0b1110,
  hs__: 0b1100,
  h_c_: 0b1010,
  h___: 0b1000,
  h_cd: 0b1011,
  hs_d: 0b1101,
  h__d: 0b1001,
  _scd: 0b0111,
  _sc_: 0b0110,
  _s_d: 0b0101,
  _s__: 0b0100,
  __cd: 0b0011,
  __c_: 0b0010,
  ___d: 0b0001,
  ____: 0b0000,
};

const FULL_DECK = Object.freeze((new Array(13).fill(REMAINING_SUITS.hscd)));

export const SUITED_COMBOS= {};
export const PAIR_COMBOS= {};
export const OFFSUIT_COMBOS= {};

const onesCount = memoize(function(bxn) {
  return parseInt(bxn
    .toString(2)
    .replace(/[^1]/g, '')
    .length
  );
})
Reflect.ownKeys(REMAINING_SUITS)
  .forEach(key => {
    const holeCardCombosFlags = REMAINING_SUITS[key];
    const count1 = onesCount(holeCardCombosFlags)
    SUITED_COMBOS[holeCardCombosFlags] = count1;
    PAIR_COMBOS[holeCardCombosFlags] = (count1 * Math.max(count1-1, 0)) / 2
  })


export const coordToCombos = (i, j, deck = FULL_DECK) => {
  const type = i < j ? SUITED : i === j ? PAIR : OFFSUIT
  switch (type) {
    case SUITED:
      return SUITED_COMBOS[deck[i] & deck[j]]
    case PAIR:
      return PAIR_COMBOS[deck[i]]
    case OFFSUIT:
      // This is cardA * cardB - suitedCombos of those cards
      return onesCount(deck[i]) * onesCount(deck[j]) - onesCount(deck[i] & deck[j])
    default:
      return 0
  }
}

export default {
  REMAINING_SUITS,
  SUITED_COMBOS,
  coordToCombos
};
