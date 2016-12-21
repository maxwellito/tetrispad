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
}

  //
  //
  //
  //
  // device.input.onmidimessage = function (e) {
  //   midiListener(e, device, index)
  // }
