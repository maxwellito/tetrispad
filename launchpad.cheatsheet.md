# Launchpad MIDI cheatsheet

These are the list of MIDI messages that can be sent from computer to the Launchpad.

| Action                       | Message exemple                                           |
| ---------------------------- | --------------------------------------------------------- |
| Key off                      | `128.key.xx`                                              |
| Set key                      | `144.key.velocity`                                        |
| Turn all keys off            | `176.0.0`                                                 |
| Set mode (note or drumpad)   | `176.0.{1..2}`                                            |
| Key light manipulation       | `176.0.{32..61}`                                          |
| Turn on all LEDs             | `176.0.{125..127}`                                        |
| Set duty cycle               | `176.{30..31}.data`                                       |
| Set LiveKeys LEDs            | `176.{104..111}.data`                                     |
| Stream update                | `146.velocity1.velocity2`, `146.velocity3.velocity4`, ... |