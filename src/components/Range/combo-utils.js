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

export const HOLE_CARD_SUITS = {
  hh: 0b1111,
  hs: 0b1110,
  hc: 0b1101,
  hd: 0b1100,
  sh: 0b1011,
  ss: 0b1010,
  sc: 0b1001,
  sd: 0b1000,
  ch: 0b0111,
  cs: 0b0110,
  cc: 0b0101,
  cd: 0b0100,
  dh: 0b0011,
  ds: 0b0010,
  dc: 0b0001,
  dd: 0b0000,
};

export const CARD_SUITS = {
  h: 0b1000,
  s: 0b0100,
  c: 0b0010,
  d: 0b0001,
};
const {h,s,c,d} = CARD_SUITS;
export const ALL_FILTERS = [
  [h,h], [h,s], [h,d], [h,c],
  [s,h], [s,s], [s,d], [s,c],
  [d,h], [d,s], [d,d], [d,c],
  [c,h], [c,s], [c,d], [c,c],
]
export const SUITED_FILTERS = [
  [h,h], [s,s], [d,d], [c,c],
]

export const REMAINING_SUITS = {
  hscd: 0b1111,
  hsc_: 0b1110,
  hs_d: 0b1101,
  hs__: 0b1100,
  h_cd: 0b1011,
  h_c_: 0b1010,
  h__d: 0b1001,
  h___: 0b1000,
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


/**
 * Take 2 cards (their suits flags number) and a set of filters and
 * convert it to the number of combos left unknown which match the
 * filters
 * @param cardI {number} binary flags for which suits remain of card
 * @param cardJ {number} binary flags for which suits remain of card
 * @param filters {array<array<number,number>>} Array of filters
 * @param [comboType] {number?} A flag for SUITED, PAIR, OFFSUIT
 * @returns {number} combos of cardI and cardJ matching filters
 */
export function combosMatchingFilters(cardI, cardJ, filters, comboType) {
  if (!(filters && filters.length > 0)) {
    return 0;
  }
  const isSuited = comboType === SUITED;
  const isPair = comboType === PAIR;

  const mirrorComboMap = {}

  return filters.reduce((total, [filterI, filterJ]) => {
    const sameSuitFilter = filterI === filterJ
    if ((isSuited && !sameSuitFilter) || (!isSuited && sameSuitFilter)) {
      return total;
    }
    // Pairs use same 2 cards, so need to make sure not to use mirrored filters
    if (isPair) {
      if (mirrorComboMap[`FILTER-${filterI}${filterJ}`]) {
        return total + 0;
      }
      mirrorComboMap[`FILTER-${filterJ}${filterI}`] = true
    }
    const cardAvailableI = (filterI & cardI) > 0;
    const cardAvailableJ = (filterJ & cardJ) > 0;
    return total + (cardAvailableI && cardAvailableJ ? 1 : 0)
  }, 0);
}

/**
 * Take coordinates on range and convert to combo count
 * @param i {number}
 * @param j {number}
 * @param deck {array} 1D Array that shows cards left in deck, it would
 *        be length 13, each index has flags for remaining cards by suit
 * @param filters
 * @return {{total: number, filtered: number}}
 */
export const coordToCombos = (i, j, deck = FULL_DECK, filters = []) => {
  const type = i < j ? SUITED : i === j ? PAIR : OFFSUIT
  let total = 0, filterable;
  switch (type) {
    case SUITED:
      total = SUITED_COMBOS[deck[i] & deck[j]];
      break;
    case PAIR:
      total = PAIR_COMBOS[deck[i]]
      break;
    case OFFSUIT:
      // This is cardA * cardB - suitedCombos of those cards
      total = onesCount(deck[i]) * onesCount(deck[j]) - onesCount(deck[i] & deck[j])
      break;
  }

  filterable = total
  if (Array.isArray(filters) && filters.length > 0) {
    filterable = combosMatchingFilters(deck[i], deck[j], filters, type);
  }

  return {
    total, filtered: filterable,
  }
}

export default {
  REMAINING_SUITS,
  SUITED_COMBOS,
  coordToCombos
};
