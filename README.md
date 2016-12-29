# TetrisPad

Single page app using the WebMIDI API to use the Novation Launchpad as a screen for a Tetris.

The interface is quite basic, the code even more. Some improvement will follow.

## Controls

- `←`, `↑`, `→`, `↓`: Move the current block
- `a`, `s`: Rotate the current block
- `spacebar`: Pause the game

## Code structure

The approach is quite classic, it's OOP.

- `Controller` class simulate the controller. It listens events from the keyboard to format and dispatch events to who needs it.
- `Launchpad` class wait for the Launchpad to be available on the MIDI API and allow to send/receive messages.
- `Grid` class is a wrapper to manages the LEDs of the Launchpad. The point of it is to facilitate the LEDs controls and reduce the amount of the messages to send the Launchpad.
- `Game` class contain the entire Tetris game logic.
