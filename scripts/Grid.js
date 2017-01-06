/**
 * Grid class
 * Wrapper to control the grid of LEDs
 * This purpose is to manipulate easily
 * the LEDs and reduce the amount of messages
 * sent to the launchpad.
 *
 */
class Grid {
  /**
   * Init the instance with the Launchpad ready
   * to receive messages.
   * The grid can take a different size of grid,
   * this is something you can play with if you want to
   * extend the grid width to 9 or reduce it.
   * The constructor reset the the grid.
   *
   * @param  {Launchpad} launchpad Launchpad object
   * @param  {number}    width     Grid width (in LEDs)
   * @param  {number}    height    Grid height (in LEDs)
   */
  constructor (launchpad, width = 8, height = 8) {
    this.launchpad = launchpad
    this.width     = width
    this.height    = height

    this.clear()
    this.clearBuffer()
  }

  /**
   * Pixeel manipulation via buffer
   */

  /**
   * Set the pixel color in the current buffer
   * @param  {number} x     Pixel X position
   * @param  {number} y     Pixel Y position
   * @param  {number} color Color to set
   */
  updatePixel(x, y, color) {
    let index = y * this.width + x
    this.bufferUpdates.push([index, color])
  }

  /**
   * Apply the current buffer to the Launchpad
   */
  render () {
    let cmd,
        keysUpdated = []
    for (let i = this.bufferUpdates.length - 1; i >= 0; i--) {
      cmd = this.bufferUpdates[i]
      if (~keysUpdated.indexOf(cmd[0]))
        continue
      keysUpdated.push(cmd[0])
      this.launchpad.setKey(this.indexToKey(cmd[0]), cmd[1])
      this.data[cmd[0]] = cmd[1]
    }
    this.clearBuffer()
    return this
  }

  /**
   * Clear the current buffer
   */
  clearBuffer () {
    this.bufferUpdates = []
  }

  /**
   * Turn off all LEDs
   * Warning, it doesn't clear the buffer.
   */
  clear() {
    this.data = new Array(this.width * this.height)
    this.data.fill(Launchpad.LED_OFF)
    this.launchpad.reset()
  }

  /**
   * Set batch data and clear the buffer
   */
  setData (data) {
    this.launchpad.batch(data)
    this.clearBuffer()
    this.data = data
  }


  /**
   * Pause method (sad patch)
   */

  /**
   * Suspend current display to show
   * a temporary screen
   */
  suspendDisplay () {
    var o = Launchpad.LED_OFF,
        f = Launchpad.LED_GREEN_FULL
    this.launchpad.batch([
      o,o,o,o,o,o,o,o,
      o,o,o,o,o,o,o,o,
      o,o,f,f,f,f,o,o,
      o,o,f,o,o,f,o,o,
      o,o,f,o,o,f,o,o,
      o,o,f,f,f,f,o,o,
      o,o,o,o,o,o,o,o,
      o,o,o,o,o,o,o,o,
    ])
  }

  /**
   * Remove the temporary screen and display
   * back the content of the data object
   */
  resumeDisplay () {
    this.launchpad.batch(this.data)
  }


  /**
   * Data methods
   */

  /**
   * Check if a line is 'on'.
   * If any of the LEds of the line index
   * provided is off, the method will return 'false'
   * @param  {Number}  lineIndex Line index to check
   * @return {Boolean}
   */
  isLineOn (lineIndex) {
    for (let i = 0; i < this.width; i++) {
      if (this.data[lineIndex * this.width + i] === Launchpad.LED_OFF)
        return false
    }
    return true
  }

  /**
   * Convert array position to key index
   * For example, this.indexToKey(10) will
   * return 18. Because the index position
   * 10 in the `data` array is linked to the
   * key 18 on the Launchpad.
   * @param  {Number} index Array inder
   * @return {Number}       Key index
   */
  indexToKey (index) {
    return Math.floor(index / this.width) * 16 + (index % this.width)
  }

  /**
   * Export the current data array into a binary
   * with 'true' for keys on, and 'false' for
   * keys off.
   * @return {Array}
   */
  getBinaryData () {
    return this.data.map(i => i !== Launchpad.LED_OFF)
  }

  /**
   * Same as `getBinaryData` but sub split it
   * into sur arrays to access data with (y, x)
   * values.
   *
   * Example
   * [
   *  1, 2, 3,
   *  4, 5, 6,
   *  7, 8, 9
   * ]
   * turn into
   * [
   *  [1, 2, 3],
   *  [4, 5, 6],
   *  [7, 8, 9]
   * ]
   * @return {Array}
   */
  getSplittedBinaryData () {
    var output = []
    this.getBinaryData().forEach((val, index) => {
      let line = Math.floor(index/this.width)
      output[line] = output[line] || []
      output[line].push(val)
    })
    return output
  }
}
