import React, {Component} from 'react'
import PropTypes from 'prop-types'
import RangeClass from './range.class'
import './range.css'
import CardDeck from '../CardDeck'
import * as R from 'ramda'

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
  </td>
)

const RowOfCombos = onClick => (row, i) => (<tr key={`row${i}`}>{ row.map(Combo(onClick, i)) }</tr>)

export default class Range extends Component {

  constructor(props) {
    super(props)
    this.state = { ...props, mouseIsDown: false, modifiers: [0b1111, 0b1111] }
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
    const {range, modifiers} = this.state

    const isMouseOverEvt = type === 'mouseover'
    const isClickEvt = type === 'click'

    if (!isClickEvt && !ctrlKey && !shiftKey) {
      return evt;
    }

    const isOn = value === 1
    if ((!isOn && isClickEvt) || (isMouseOverEvt && ctrlKey))
      range.add(i,j)
    else if ((isOn && isClickEvt) || (isMouseOverEvt && shiftKey))
      range.remove(i, j)

    this.updateRange(range)
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
      this.state.range.setDeadCards(value);
      this.state.deadCards = this.state.range.deadCards.join('')
      evt.target.value = ''
      this.setState(this.state);
    }
  }

  render() {
    const currentRange = this.state.range

    return <main className='container'>
      <div className='row'>
        <div className="col-4">
          <h2>Percent of Range: { currentRange.percentageOf('disabled') }</h2>
        </div>
        <div className="col-4">
          <h2>Percent of All: { currentRange.percentageOf() }</h2>
        </div>
        <div className="col-4">
          <h2>Combos: { currentRange.totalCombos }</h2>
        </div>
      </div>

      <div className='row controls'>
        <div className="col form">
          <input type="text"/>
        </div>
      </div>
      <section className='row m-3'>
        <div className="col">
          <table className={`table Range ${currentRange.level}`}>
            <tbody>
            { this.state.rangeArray.map(RowOfCombos(this.toggleCombo)) }
            </tbody>
          </table>
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
