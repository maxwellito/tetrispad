/**
 * Launchpad class
 * Manage access and interact with
 * the Launchpad
 *
 * Once connected, the instance will have the property
 * `input` and `output` filled with MIDI interface to
 * communicate with the device.
 *
 * Example
 * myLaunchpad.input.onmidimessage = function (e) {
 *    console.log(e.data)
 *    // [144, 49, 127]
 * }
 * myLaunchpad.output.send([144, 49, Launchpad.LED_YELLOW])
 */
class Launchpad {

  /**
   * The constructor take only the device name
   * to catch, in our case the 'Launchpad Mini'.
   * However this value can be change for other
   * devices like the original 'Launchpad'
   * @param  {[type]} deviceName 'Launchpad Mini' [description]
   * @return {[type]}            [description]
   */
  constructor (deviceName = 'Launchpad') {
    this.deviceName = deviceName
    this.input = null
    this.output = null
    this.listeners = []
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

        for (i = 0; i < inputs.length; i++)
        {
          input = inputs[i]
          if (input.type === 'input'  && ~input.name.indexOf(this.deviceName)) {
            this.input  = input
            this.input.onmidimessage = e => {
              this.listeners.forEach(listener => {
                listener && listener(e.data)
              })
            }
          }
        }
        
        for (i = 0; i < outputs.length; i++)
        {
          output = outputs[i]
          if (output.type === 'output' && ~output.name.indexOf(this.deviceName)) {
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
   * By default, if the value is not set or invalid
   * it will set the value to high.
   * @param  {string} brightness Brightness level ('low'/'medium'/'high')
   */
  full (brightness) {
    let brightnessMap = {
      low: 125,
      medium: 126,
      high: 127
    }
    this.output.send([176, 0, brightnessMap[brightness] || brightnessMap.high])
  }

  /**
   * Set all LEDs in a batch by providing
   * all the values in a array
   * @param  {array} input RAW values
   */
  batch (input) {
    for (var i = 0; i < input.length;) {
      this.output.send([146, input[i++], input[i++]])
    }
    this.data = input
    this.setKey(0, input[0])
  }

  /**
   * Set the velocity value for a key
   * @param {number} key   Key number to set
   * @param {number} value Velocity value to set
   */
  setKey (key, value) {
    this.output.send([144, key, value])
  }

  /**
   * Events
   */

   /**
    * Method to listening on a message event
    * @param  {function} listener Listener to call
    * @return {function}          Function to stop listening
    */
   onMessage (listener) {
     var listenerIndex = this.listeners.length
     this.listeners.push(listener)

     return function () {
       this.listeners[listenerIndex] = null
     }
   }
}

/**
 * Keys constants
 * Velocity values used for set LED keys
 * @type {Number}
 */
Launchpad.LED_OFF        = 0b001100
Launchpad.LED_RED_LOW    = 0b001101
Launchpad.LED_RED_MED    = 0b001110
Launchpad.LED_RED_FULL   = 0b001111
Launchpad.LED_AMBER_LOW  = 0b011101
Launchpad.LED_AMBER_MED  = 0b101110
Launchpad.LED_AMBER_FULL = 0b111111
Launchpad.LED_YELLOW     = 0b111110
Launchpad.LED_GREEN_LOW  = 0b011100
Launchpad.LED_GREEN_MED  = 0b101100
Launchpad.LED_GREEN_FULL = 0b111100
