# TetrisPad

Plug your Novation Launchpad and [PLAY!](http://maxwellito.github.io/tetrispad/)

Single page app using the WebMIDI API to use the [Novation Launchpad](https://global.novationmusic.com/launch/launchpad-mini) as a screen for a Tetris.

<a href="https://twitter.com/mxwllt/status/819245451270615040">
  <img alt="Demo of Tetrispad" src="https://raw.githubusercontent.com/maxwellito/tetrispad/master/assets/live.jpg" width="480">
</a>



## Controls

- `←`, `→`, `↓`: Move the current block
- `a`, `s`: Rotate the current block
- `spacebar`: Pause the game

## Code structure

The approach is quite classic, it's OOP.

- `Controller` class simulate the controller. It listens events from the keyboard to format and dispatch events to who needs it.
- `Launchpad` class wait for the Launchpad to be available on the MIDI API and allow to send/receive messages.
- `Grid` class is a wrapper to manages the LEDs of the Launchpad. The point of it is to facilitate the LEDs controls and reduce the amount of the messages to send the Launchpad.
- `Game` class contain the entire Tetris game logic.


## Contributors

Any crazy ideas are welcome (as long as your help :)

Please don't ask to setup a Webpack+Babel+WhatsoEver.. The Midi API is only accessible on modern browsers and these ones should be ES6 ready: feel again this pleasure to work on a repo without build system, it's so niiiice :)
