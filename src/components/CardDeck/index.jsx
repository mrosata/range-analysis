import React, {PureComponent} from 'react'
import cardToUC from './unicode.cards'
import './card-deck.css'


class Deck extends PureComponent {
  static rand = n => Math.floor(Math.random() * n)

  static values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

  constructor(props) {
    super(props)
    const {card = '', extraCssClasses = ''} = props
    const vals = Deck.values
    const suits = ['d', 'h', 'c', 's']
    const baseCssClasses = `d-inline-block m-2 deck-class-card card-sprite ${extraCssClasses}`
    const [v,s] = card.split('')

    this.state = {
      cssClasses: `${s === 'c' || s === 's' ? 'black' : 'red'} ${baseCssClasses}`,
      card: cardToUC(v, s),
      style: {
        backgroundPositionX: `${(vals.indexOf(v)+1) * 75}px`,
        backgroundPositionY: `${(suits.indexOf(s) + 1) * 112}px`,
      }
    }
  }


  render() {
    const {cssClasses, card, style} = this.state


    return <div
      className={cssClasses}
      style={style}
    >
      { <i className='sr-only'>{ card }</i> }
    </div>
  }
}

export default Deck
