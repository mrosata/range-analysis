import React, {Component} from 'react'
import PropTypes from 'prop-types'
import RangeClass from './range.class'
import './range.css'
import CardDeck from '../CardDeck'
import * as R from 'ramda'
import {ALL_FILTERS, CARD_SUITS} from './combo-utils'

const {map} = R

const Combo = (handleComboSelect, rowIdx) => (combo, colIdx) => (
  <td key={`row${rowIdx}-row${colIdx}`}
      className={`${combo.state} ${combo.type}`.trim()}
      onClick={handleComboSelect(rowIdx,colIdx,combo)}
      onMouseOverCapture={handleComboSelect(rowIdx, colIdx, combo)}
      onKeyDown={handleComboSelect(rowIdx, rowIdx, colIdx)}
      tabIndex='0'
  >
    { combo.text }
    <small>{combo.filtered}</small>
  </td>
)

const RowOfCombos = onClick => (row, i) => (<tr key={`row${i}`}>{ row.map(Combo(onClick, i)) }</tr>)

function suitIcon(suit) {
  switch (suit) {
    case CARD_SUITS.h:
      return <span data-suit='h' className='suit-red'>{` ♥️ `}</span>;
    case CARD_SUITS.s:
      return <span data-suit='s' className='suit-black'>{` ♠ `}</span>;
    case CARD_SUITS.c:
      return <span data-suit='c' className='suit-black'>{` ♣️️ `}</span>;
    case CARD_SUITS.d:
      return <span data-suit='d' className='suit-red'>{` ♦️ `}</span>;
  }
  return <span>X</span>
}

export default class Range extends Component {

  static propTypes = {
    range: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = { ...props, mouseIsDown: false, modifiers: [], modifiersState: {} }
    if (!this.state.range)
      this.state.range = new RangeClass(props);
    this.state.rangeArray = this.state.range.toArray();
  }

  updateRange = range => {
    const rangeArray = range.toArray();
    this.setState({
      ...this.state, range, rangeArray, toggleOffOn: 0,
    })
  }

  toggleCombo = (i, j, {value}) => evt => {
    const { type, ctrlKey, shiftKey, altKey } = evt
    const {range, modifiers } = this.state
    const filters = modifiers.length ? modifiers : undefined;
    const isMouseOverEvt = type === 'mouseover'
    const isClickEvt = type === 'click'
    if (!isClickEvt && !ctrlKey && !shiftKey && !altKey) {
      return evt;
    }

    const isOn = value === 1
    if (!isOn && (isClickEvt || (isMouseOverEvt && ctrlKey))) {
      range.add(i,j, filters)
    }
    else if (isOn && (isClickEvt || (isMouseOverEvt && shiftKey)))
      range.remove(i,j)
    else if (altKey)
      isOn ? range.add(i,j, filters) : range.remove(i,j, filters); // Added this b/c it helps with filtering already on combos

    this.updateRange(range)
  }

  toggleModifier = (suitI, suitJ) => {
    const modifiersState = {}
    const modifiers = this.state.modifiers.slice(0);
    const idx = modifiers.findIndex(f => {
      return suitI === f[0] && suitJ === f[1]
    })
    if (idx === -1) {
      modifiers.push([suitI, suitJ])
    }
    else {
      modifiers.splice(idx, 1)
    }

    for (let i = 0; i < modifiers.length; i++) {
      const f1 = modifiers[i]
      if (!Array.isArray(f1)) { continue }
      const key = `${f1[0]}${f1[1]}`
      modifiersState[key] = 'active'
    }

    this.setState({
      ...this.state,
      modifiers,
      modifiersState,
    })
  }

  getNextRange = () => {
    const rangeChild = this.state.range.getChildren(true)[0]
    this.updateRange(rangeChild)
  }

  // Get prev range (or return the same range)
  getPrevRange = () => {
    const rangeParent = this.state.range.getParent();
    this.updateRange(rangeParent || this.state.range);
  }

  setAllOnCurrentRange = (value = 0) => {
    const range = this.state.range;
    range.setAllTo(value);
    this.updateRange(range);
    this.setState({...this.state, toggleOffOn: value === 1 ? 0 : 1 })
  }

  updateRangeLabel = ({target: {value}}) => {
    if (value !== this.state.range.label) {
      this.state.range.setLabel(value)
      this.setState(this.state);
    }
  }

  updateDeadCards = (evt) => {
    const value = evt.target.value || ''
    if (value && `${value.length}` % 2 === 0 && value !== this.state.range.deadCards.join('')) {
      const range = this.state.range.setDeadCards(value);
      this.state.deadCards = this.state.range.deadCards.join('')
      evt.target.value = ''
      this.forceUpdate();
    }
  }

  render() {
    const currentRange = this.state.range

    return <main className='container'>

      <section className='row m-3'>
        <div className="col-md-9">
          <table className={`table Range ${currentRange.level}`}>
            <tbody>
            { this.state.rangeArray.map(RowOfCombos(this.toggleCombo)) }
            </tbody>
          </table>
        </div>
        <div className="col-md-3">

          <div className='row controls mb-3 ml-2'>
            <div className="col-xs-5">
              <div className="row">
                { ALL_FILTERS.map(([filterI, filterJ]) => {
                  return <div
                    className={`col-3 modifier ${ this.state.modifiersState[`${filterI}${filterJ}`]}`}
                    key={ `suit-filter-${filterI}-${filterJ}` }
                    onClick={ () => this.toggleModifier(filterI, filterJ) }
                  >
                    { suitIcon(filterI) }{ suitIcon(filterJ) }
                  </div>
                })}
              </div>
            </div>
          </div>

          <div className='row stats ml-2'>
            <div className="col-xs-4">
              <div className="row mb-2">
                <h5>Percent of Range: { currentRange.percentageOf('disabled') }</h5>
              </div>
              <div className="row mb-2">
                <h5>Percent of All: { currentRange.percentageOf() }</h5>
              </div>
              <div className="row mb-2">
                <h5>Combos: { currentRange.totalCombos }</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row">

        <div className="col">
          <button className={'next-range btn btn-info'}
                  onClick={this.getPrevRange}
          >
            Get Prev
          </button>
        </div>

        <div className="col">
          <button className={'next-range btn btn-info'}
                  onClick={this.getNextRange}
          >
            Get Next
          </button>
        </div>

        <div className="col">
          <button
            className='btn btn-danger'
            onClick={ () => this.setAllOnCurrentRange(this.state.toggleOffOn) }
          >
            TOGGLE ALL { this.state.toggleOffOn === 1 ? 'ON' : 'OFF' }
          </button>
        </div>
      </div>
      <input type={'text'}
             value={currentRange.label}
             name={'range-label'}
             placeholder={'Enter name for range'}
             onChange={this.updateRangeLabel}
      />

      <h2 className='lead'>{ currentRange.label }</h2>


      <div className="row">

        <div className="col">
          <input
            className='form-control'
            type={'text'}
            name={'dead-cards'}
            placeholder={'Dead Cards'}
            onChange={this.updateDeadCards}
          />
        </div>

        <div className="col-12">
          <div className='dead-cards'>
            { currentRange.deadCards.map(card => <CardDeck key={card} card={card}/>) }
          </div>
        </div>

      </div>

    </main>
  }

}
