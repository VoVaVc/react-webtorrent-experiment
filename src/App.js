import React, { Component } from 'react';
import './App.css';

// plugins
import FilePicker from './components/file-picker.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <FilePicker/>
      </div>
    );
  }
}

export default App;
