/**
 * Manage access to Launchpad
 *
 *
 * connection    : "closed"
 * id            : "-1814679681"
 * manufacturer  : "AKAI PROFESSIONAL,LP"
 * name          : "MPK mini"
 * onstatechange : null
 * state         : "connected"
 * type          : "output"
 * version       : ""
 */
class Launchpad {
  constructor (deviceName = 'Launchpad Mini') {
    this.deviceName = deviceName
    this.input = null
    this.output = null
  }

  /**
   * Get the accessed device.
   * If null, please call `accessDevice` first.
   * @return {[type]} [description]
   */
  isConncted () {
    return this.input && this.output
  }

  /**
   * Start to load all the required assets from the
   * list provided to the constructor
   *
   * @return {promise} Is the load a success?
   */
  accessDevice () {
    return window.navigator
      .requestMIDIAccess()
      .then((access) => {
        // Test deprecated browsers
        if ('function' === typeof access.inputs || !access.inputs) {
          throw new Error('Your browser is deprecated and use an old Midi API.')
        }

        // Get MIDI devices
        var i, input, output,
            inputs  = Array.from(access.inputs.values()),
            outputs = Array.from(access.outputs.values())

        for (i = 0; i < inputs.length; i++) {
          input = inputs[i]
          output = outputs[i]
          if (input.type === 'input'  && input.name === this.deviceName &&
              output.type === 'output' && output.name === this.deviceName) {
            this.input  = input
            this.output = output
            return this
          }
        }

        // No device found
        throw new Error(`Device ${this.deviceName} not found.`)
      })
  }

  /* Commands **********************************/

  /**
   * Reset the launchpad by setting all LEDs
   * to off
   */
  reset () {
    this.output.send([176, 0, 0])
  }

  /**
   * Set all LEDs on with a level of brightness
   * @param  {string} brightness Brightness level (low/medium/high)
   */
  full (brightness) {
    let brightnessMap = {
      low: 125,
      medium: 126,
      high: 127
    }
    this.output.send([176, 0, brightnessMap[brightness]])
  }

  /**
   * Set all LEDs in a batch by providing
   * all the values in a array
   * @param  {array} input RAW values
   */
  batch (input) {
    for (var i = 0; i < input.length; i++) {
      this.output.send([146, input[i++], input[i++]])
    }
  }
}

Launchpad.LED_OFF        = 0b001100
Launchpad.LED_RED_LOW    = 0b001101
Launchpad.LED_RED_FULL   = 0b001111
Launchpad.LED_AMBER_LOW  = 0b011101
Launchpad.LED_AMBER_FULL = 0b111111
Launchpad.LED_YELLOW     = 0b111110
Launchpad.LED_GREEN_LOW  = 0b011100
Launchpad.LED_GREEN_FULL = 0b111100

  //
  //
  //
  //
  // device.input.onmidimessage = function (e) {
  //   midiListener(e, device, index)
  // }
