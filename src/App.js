import React, { Component } from 'react';
import Range from './components/Range';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

class App extends Component {
  render() {
    return (
      <div className='App'>
        <div className='jumbotron jumbotron-fluid'>
          <div className='container'>
            <h1 className='display-4'><code>70%</code> Street</h1>
            <p className='lead'>
              Click to toggle 1 hand combo, mouse over holding <code>CTRL</code>
              or <code>SHIFT</code> to add/remove combos quickly. Use the suits filter to the
              right if you'd like to continue with specific suits only. <em>Note, having no suits
              selected is the same as having all the suits selected.</em>
            </p>
            <p>
              You can move from street to street (<em>or action to action</em>) by pressing the "next" or
              "prev" buttons. When you move to a future action, only combos you continued with will be
              available for filtering.
            </p>
            <p>
              At the bottom of the page, type in dead cards and the combos will account for dead
            cards in each combo! Additionally, if you add dead cards on one street, those dead
            cards won't effect previous streets
            </p>
            <p><strong>Remember! You should continue with the same % of hands relative to the hands you've
            already continued with for unexploited play.</strong></p>

          </div>
        </div>
        <Range/>
      </div>
    );
  }
}

export default App;
