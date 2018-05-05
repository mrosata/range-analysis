import React, {Component} from 'react'
import PropTypes from 'prop-types'
import RangeClass from './range.class'
import './range.css'
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
    this.state = { ...props, mouseIsDown: false }
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
    const isMouseOverEvt = evt.type === 'mouseover'
    const isClickEvt = evt.type === 'click'
    if (!isClickEvt && !evt.ctrlKey && !evt.shiftKey) {
      return
    }
    const range = this.state.range
    const isOn = value === 1
    if ((!isOn && isClickEvt) || (isMouseOverEvt && evt.ctrlKey))
      range.add(i,j)
    else if ((isOn && isClickEvt) || (isMouseOverEvt && evt.shiftKey))
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

    return <div>
      <h2>Percent of Range: { currentRange.percentageOf('disabled') }</h2>
      <h2>Percent of All: { currentRange.percentageOf() }</h2>
      <h2>Combos: { currentRange.totalCombos }</h2>
      <h3>{ currentRange.label }</h3>
      <button className={'next-range'}
              onClick={this.getPrevRange}
      >Get Prev
      </button>
      -
      <button className={'next-range'}
              onClick={this.getNextRange}
      >Get Next
      </button>

      <input type={'text'}
             value={currentRange.label}
             name={'range-label'}
             placeholder={'Enter name for range'}
             onChange={this.updateRangeLabel}
      />

      <br/>
      <span>{ currentRange.deadCards.join(' ') }</span>
      <input type={'text'}
             name={'dead-cards'}
             placeholder={'Dead Cards'}
             onChange={this.updateDeadCards}
      />

      <table className={`Range ${currentRange.level}`}>
        <tbody>
        { this.state.rangeArray.map(RowOfCombos(this.toggleCombo)) }
        </tbody>
      </table>
      <button
        onClick={ () => this.setAllOnCurrentRange(this.state.toggleOffOn) }
      >
        TOGGLE ALL { this.state.toggleOffOn === 1 ? 'ON' : 'OFF' }
      </button>
    </div>
  }

}
