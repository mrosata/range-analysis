import React, { Component } from 'react';
import Range from './components/Range';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Range/>
      </div>
    );
  }
}

export default App;
