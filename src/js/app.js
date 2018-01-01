import React, { Component } from 'react';
import { render } from 'react-dom';

import '../styles/main.scss'; // Import CSS

import keenImage from '../assets/keen.png'; // Importing image

export default class Hello extends Component {
  render() {
    return (
      <div>
        Hello from react!!!
        <img src={ keenImage } alt='Commander Keen' />

      </div>
    );
  }
}

render(<Hello />, document.getElementById('app'));
