import uniq from 'ramda/src/uniq'
import {REMAINING_SUITS, CARDS, SUITS, SUITED_COMBOS, coordToCombos} from './combo-utils'
const GENERIC_COMBO_RE = /([2-9TJQKA])([2-9TJQKA])[so]?/i
const CARD_SUIT_SHORTHAND_RE = /([2-9ATJKQ][shdc])/i

const defaultBaseRange = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
];


const valFromCardStr = (cardStr) =>
  CARDS.indexOf(`${cardStr}`.toUpperCase());

const coordsFromComboStr = comboStr => {
  if (GENERIC_COMBO_RE.test(comboStr)) {
    const matches = GENERIC_COMBO_RE.exec(comboStr);
    const i = valFromCardStr(matches[1]);
    const j = valFromCardStr(matches[2]);
    const suited = matches[3].toUpperCase() === 's'
    return suited ? [i, j] : [j, i]
  }
  return [-1, -1]
}

const coordToStr = (i,j) => {
  const suffix = i < j ? 's' : i === j ? '' : 'o'
  return `${CARDS[i]}${CARDS[j]}${suffix}`;
}
const coordToType = (i,j) => {
  return i < j ? 'suited' : i === j ? 'pair' : 'offsuit'
}

function toFixed(n, num) {
  return Math.floor(num * Math.pow(10, n)) / Math.pow(10, n)
}

function toPercent(rangeComboCount, entireRangeArray, excludeKey) {
  const selected = toComboCount(rangeComboCount, 'on', false)
  const total = toComboCount(entireRangeArray, '', true, excludeKey);
  return toFixed(3, (selected / total)*100);
}

function toComboCount(rangeArray, state = 'on', includeAll = false, excludeState = '') {
  return rangeArray.reduce((rowTotals, row) => {
    return rowTotals + row.reduce((handTotals, comboObj) => {
      const s = comboObj.state;
      return handTotals + +(s !== excludeState && (comboObj.state === state || includeAll) ? comboObj.combos : 0);
    }, 0)
  }, 0)
}

function guessLabelFromTree(parent, level = 0) {
  if (parent && parent.parent !== parent) {
    return guessLabelFromTree(parent.parent, ++level);
  }
  switch(level) {
    case 0:
      return 'Pre-Flop';
    case 1:
      return 'Post-Flop';
    case 2:
      return 'Turn';
    case 3:
      return 'River';
    default:
      return `${level}`;
  }
}

export default class Range {

  static freshDeck () {
    return Array(13).fill(REMAINING_SUITS.hscd);
  }

  static of(config) {
    return new Range(config)
  }

  // Make sure this range doesn't enable any combos it's parent doesn't have
  static enforceOrder(range) {
    const parent = range.getParent().toArray()
    const child = range.toArray()
    for (let i = 0; i < parent.length; i++) {
      const parentRow = parent[i];
      const childRow = child[i];
      for (let j = 0; j < parentRow.length; j++) {
        if (parentRow[j].value === 0) {
          range.remove(i, j);
          const c = range.comboAt(i,j);
          c.state = 'disabled';
        }
        else if (childRow[j].state === 'disabled') {
          const c = range.comboAt(i, j);
          c.state = 'off';
        }
      }
    }
    return range;
  }

  constructor({base = defaultBaseRange, parent, label = '', deadCards = [] }) {
    const setDisabled = parent !== null
    this.level = parent ? parent.level : 0

    this.deck = parent && parent.deck ? parent.deck : Range.freshDeck()

    function intToObj(combo, i, j, deck) {
      return {
        value: +combo,
        state: +combo === 1 ? 'on' : setDisabled ? 'disabled' : 'off',
        type: coordToType(i,j),
        text: coordToStr(i,j),
        combos: coordToCombos(i, j, deck)
      }
    }

    this.base = base.map(
      (row,i) => row.map((combo,j) => typeof combo === 'object' ? combo : intToObj(combo, i, j, this.deck))
    );
    this.current = this.base.map(
      (row,i) => row.map(
        (combo,j) => ({
          ...combo,
          state: combo.value === 1 ? 'on' : setDisabled ? 'disabled' : 'off',
        })));
    this.children = []
    this.parentsDeadCards = parent && parent.deadCards ? parent.deadCards : []
    this.deadCards = this.parentsDeadCards.slice(0)
    this.parent = parent || null
    this.label = label ? label : guessLabelFromTree(parent)
    this.totalCombos = this.toComboCount()
  }

  rootRange() {
    if (this.parent && typeof this.parent.rootRange === 'function') {
      return this.parent.rootRange();
    }
    return this;
  }

  toComboCount() {
    return toComboCount(this.toArray(), 'on')
  }

  percentageOf(exclusionKey) {
    const rangeArray = this.toArray()
    const entireRangeArray = this.parent ? this.toArray() : this.toArray()
    if (exclusionKey) {
      return toPercent(rangeArray, entireRangeArray, exclusionKey);
    }
    return toPercent(rangeArray, entireRangeArray);
  }

  createChild() {
    const child = Range.of({base: this.current, parent: this });
    this.children.push(child);
    return child
  }

  getChildren(createIfEmpty = false) {
    if (!this.children.length && createIfEmpty) {
      this.createChild();
    }
    return this.children.map(Range.enforceOrder);
  }

  getParent() {
    return this.parent
  }

  comboAt(i,j) {
    // TODO: Validate i and j here
    return this.current[i][j]
  }

  add(i,j) {
    const combo = this.comboAt(i,j);
    if (combo.state === 'disabled') { return this }
    combo.value = Math.max(this.base[i][j].value, 1);
    combo.state = combo.value === 1 ? 'on' : 'off';
    this.totalCombos = this.toComboCount()
    return this;
  }

  remove(i,j) {
    const combo = this.comboAt(i,j);
    if (combo.state === 'disabled') { return this }
    combo.value = 0;
    combo.state = combo.value === 1 ? 'on' : 'off';
    if (this.children.length) {
      this.children.map(Range.enforceOrder)
    }
    this.totalCombos = this.toComboCount()
    return this;
  }

  setAllTo(value = 1) {
    const rangeArray = this.toArray();
    const setOn = +value === 1;
    for (let i = 0;i<rangeArray.length; i++) {
      const rangeArrayRow = rangeArray[i];
      for (let j = 0;j<rangeArrayRow.length; j++) {
        if (setOn)
          this.add(i, j);
        else
          this.remove(i, j);
      }
    }
    this.totalCombos = this.toComboCount()
    return this;
  }

  setCombo(comboStr, value = 1) {
    const [i,j] = coordsFromComboStr(comboStr)
    if (i === -1 || j === -1) {
      return new Error('Invalid Combo')
    }
    return value === 1 ? this.add(i,j) : this.remove(i,j)
  }


  setLabel(value) {
    this.label = value;
  }


  setDeadCards(value) {
    let dead
    if (typeof value === 'string') {
      dead = `${value}`.match(CARD_SUIT_SHORTHAND_RE)
    }

    if(Array.isArray(dead)) {
      const dc = uniq(dead.concat(this.deadCards, this.parentsDeadCards).map(vs => `${vs}`.replace(/^([2-9AKQJT])/i, (i, l) => {
        return l.toUpperCase()
      })))
      this.deadCards = dc
      this.deck = Range.freshDeck()
      for (let i = 0; i < dc.length; i++){
        const card = dc[i];
        if (!(card && typeof card === 'string')) {
          continue;
        }
        const valIdx = CARDS.indexOf(card.charAt(0))
        if (valIdx === -1)
          continue;
        const suit = card.substr(1)
        // Remove the suit from the deck
        this.deck[valIdx] = this.deck[valIdx] ^ SUITS[suit];
      }
    }
    this.updateCombos()
  }

  toArray() {
    return this.current;
  }

  toJSON() {
    return JSON.stringify(this.toArray());
  }

  updateCombos() {
    const deck = this.deck
    for (let i = 0; i < this.current.length; i++) {
      const row = this.current[i];
      for (let j = 0; j < row.length; j++) {
        row[j].combos = coordToCombos(i, j, deck)
      }
    }
  }
}
