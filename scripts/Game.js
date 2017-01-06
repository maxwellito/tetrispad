/**
 * Game class
 * The Tetris game.
 * It takes input from a Controller object
 * and manipulate a Grid object to display
 * the game state.
 */
class Game {

  /**
   * Init
   * @param  {Grid} grid             Grid to output
   * @param  {Controller} controller Command input
   * @param  {Number} interval       Interval between actions in ms
   */
  constructor (grid, controller, interval) {
    this.grid = grid
    this.controller = controller
    this.interval = interval

    this.countPreviousMove = null
    this.countCurrentMove = 0

    this.currentBlock = null
    this.currentGrid = this.grid.getSplittedBinaryData()
  }

  /**
   * Public controls
   */

  /**
   * Start the game
   */
  start () {
    this.grid.clear(Launchpad.LED_OFF)
    this.pickNewBlock()
    this.controller.onKey(this.keyListener.bind(this))
    this.play()
  }

  /**
   * Pause/resume the game
   */
  pause () {
    if (this.timer) {
      this.stop()
      this.grid.suspendDisplay()
    }
    else {
      this.play()
      this.grid.resumeDisplay()
    }
  }

  /**
   * End the game
   * It clear the interval and display the
   * animation of end.
   */
  end () {
    this.stop()

    var countdown = 8;
    var liner = () => {
      countdown--
      if (countdown < 0)
        return

      return this
        .waitNextFrame(this.interval / 16)
        .then(() => {
          this.setLines([countdown], Launchpad.LED_RED_FULL)
          return liner()
        })
    }
    liner()
  }

  /**
   * Internal
   */

  /**
   * Start the interval
   */
  play () {
    if (this.timer) {
      return
    }
    this.timer = setInterval(() => {
      this.increment()
    }, this.interval)
  }

  /**
   * Stop the interval
   */
  stop () {
    clearInterval(this.timer)
    this.timer = null
  }


  /**
   * Script executed in every interval.
   * If the current block can't be moved to step
   * down, the script will execute the method
   * for the end of block and move on to the next one
   */
  increment () {
    if (this.moveBlock('down'))
      return
    this.cleanUp()
  }

  /**
   * Listener for the controller
   * @param  {Object} e Command to execute
   */
  keyListener (e) {
    switch (true) {
    case !!e.move:
      return this.moveBlock(e.move)
    case !!e.rotate:
      return this.rotateBlock(e.rotate)
    case !!e.pause:
      return this.pause()
    }
  }

  /**
   * Step between new blocks.
   * It make sure the last two block moved,
   * otherwise it's the end of the game.
   * It checks for complete lines to clean.
   */
  cleanUp () {
    if (this.countCurrentMove === 0 && this.countPreviousMove === 0)
      return this.end()

    this.countPreviousMove = this.countCurrentMove
    this.countCurrentMove = 0

    var completeLines = []
    for (let line = 0; line < this.grid.height; line++) {
      if (this.grid.isLineOn(line))
        completeLines.push(line)
    }
    this.blinkAndClearLines(completeLines)
  }

  /**
   * Put the game on pause and clean up
   * the line indexes provided in parameter.
   * @param  {Array} lineIndexes Array of line indexes to clean
   */
  blinkAndClearLines (lineIndexes) {
    // If no line to clean up, lest load the next block
    if (!lineIndexes.length) {
      this.next()
      return
    }

    // Stop the interval, time to animate the complete
    // lines and and resume the interval
    this.stop()
    this
      .waitNextFrame(this.interval / 8)
      .then(() => {
        this.setLines(lineIndexes, Launchpad.LED_GREEN_FULL)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        this.setLines(lineIndexes, Launchpad.LED_YELLOW)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        this.setLines(lineIndexes, Launchpad.LED_AMBER_FULL)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        this.setLines(lineIndexes, Launchpad.LED_RED_FULL)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        // Clean up the Grid data to remove the complete lines
        var newData = Array.from(this.grid.data)
        lineIndexes
          .reverse()
          .forEach(lineIndex => {
            newData.splice(lineIndex * this.grid.width, this.grid.width)
          })
        var offset = new Array(lineIndexes.length * this.grid.width)
        offset.fill(Launchpad.LED_OFF)
        this.grid.setData(offset.concat(newData))

        // Load next block and resume the interval
        this.next()
        this.play()
      })
  }

  /**
   * Method use to freeze the current grid and load
   * the next block
   */
  next () {
    this.currentGrid = this.grid.getSplittedBinaryData()
    this.pickNewBlock()
  }

  /**
   * Block manipulation
   */

  /**
   * Move the current block to the direction provided
   * in parameter.
   * @param  {String} direction Direction : 'left', 'right', 'down'
   * @return {Boolean}          If the move was possible and successful
   */
  moveBlock (direction) {
    let block = this.currentBlock,
        isSuccess = false

    this.setPattern(Launchpad.LED_OFF)

    switch (direction) {
    case 'down':
      if (isSuccess = this.doesPatternFit(block.pattern, block.x, block.y + 1))
        block.y++
      break
    case 'left':
      if (isSuccess = this.doesPatternFit(block.pattern, block.x - 1, block.y))
        block.x--
      break
    case 'right':
      if (isSuccess = this.doesPatternFit(block.pattern, block.x + 1, block.y))
        block.x++
      break
    }

    if (isSuccess) {
      this.countCurrentMove++
      this.setPattern(block.color)
      this.grid.render()
    }
    else {
      this.grid.clearBuffer()
    }

    return isSuccess
  }

  /**
   * Rotate the current block to the direction provided
   * in parameter.
   * @param  {String} direction Direction : 'left', 'right', 'down'
   * @return {Boolean}          If the move was possible and successful
   */
  rotateBlock (direction) {
    let block = this.currentBlock,
        newPattern = []

    switch (direction) {
    case 'right':
      for (let x = block.pattern[0].length - 1; x >= 0; x--) {
        let row = []
        for (let y = 0; y < block.pattern.length; y++) {
          row.push(block.pattern[y][x])
        }
        newPattern.push(row)
      }
      break
    case 'left':
      for (let x = 0; x < block.pattern[0].length; x++) {
        let row = []
        for (let y = block.pattern.length - 1; y >= 0; y--) {
          row.push(block.pattern[y][x])
        }
        newPattern.push(row)
      }
      break
    }

    if (newPattern && this.doesPatternFit(newPattern, block.x, block.y)) {
      this.setPattern(Launchpad.LED_OFF)
      block.pattern = newPattern
      this.setPattern(block.color)
      this.grid.render()
      return true
    }
    else {
      return false
    }
  }

  /**
   * Checks if a block(:pattern) can fit on a
   * certain position
   * @param  {Array}  pattern Block pattern
   * @param  {Number} x       Position X
   * @param  {Number} y       Position Y
   * @return {Boolean}        Positive if it fits
   */
  doesPatternFit (pattern, x, y) {
    if (x < 0 || (x + pattern[0].length) > 8 || y < 0 || (y + pattern.length) > 8)
      return false

    for (let yIndex = 0; yIndex < pattern.length; yIndex++) {
      for (let xIndex = 0; xIndex < pattern[0].length; xIndex++) {
        if (pattern[yIndex][xIndex] && this.currentGrid[y + yIndex][x + xIndex])
          return false
      }
    }
    return true
  }

  /**
   * Apply the current block to the grid with
   * the color provided
   * @param {Number} color Launchpad velocity value
   */
  setPattern (color) {
    for (let yIndex = 0; yIndex < this.currentBlock.pattern.length; yIndex++) {
      for (let xIndex = 0; xIndex < this.currentBlock.pattern[0].length; xIndex++) {
        if (this.currentBlock.pattern[yIndex][xIndex])
          this.grid.updatePixel(this.currentBlock.x + xIndex, this.currentBlock.y + yIndex, color)
      }
    }
  }

  /**
   * Blocks
   */

  /**
   * Pick a new block as currentBlock
   * and set it's position
   */
  pickNewBlock () {
    this.currentBlock = this.getRandomBlocks()
    this.currentBlock.x = Math.floor((8 - this.currentBlock.pattern[0].length) / 2)
    this.currentBlock.y = 0
    this.setPattern(this.currentBlock.color)
    this.grid.render()
  }

  /**
   * Get a random block
   * A block is an object defining the pattern
   * and the color of it
   * @return {Object}
   */
  getRandomBlocks () {
    var blocks = [
      {
        color: Launchpad.LED_RED_FULL,
        pattern:[
          [1, 1, 1],
          [1, 0, 0]
        ]
      },
      {
        color: Launchpad.LED_RED_FULL,
        pattern:[
          [1, 1, 1],
          [0, 0, 1]
        ]
      },
      {
        color: Launchpad.LED_YELLOW,
        pattern:[
          [1, 1],
          [1, 1]
        ]
      },
      {
        color: Launchpad.LED_YELLOW,
        pattern:[
          [1, 1, 1, 1]
        ]
      },
      {
        color: Launchpad.LED_GREEN_FULL,
        pattern:[
          [0, 1, 1],
          [1, 1, 0]
        ]
      },
      {
        color: Launchpad.LED_GREEN_FULL,
        pattern:[
          [1, 1, 0],
          [0, 1, 1]
        ]
      },
      {
        color: Launchpad.LED_AMBER_FULL,
        pattern:[
          [1, 1, 1],
          [0, 1, 0]
        ]
      }
    ]
    return blocks[Math.floor(Math.random() * blocks.length)]
  }

  /**
   * Utils
   */

  /**
   * Set a line to the color requested
   * @param {Number} lineIndexes Line inder to fill
   * @param {Number} color       Launchpad velocity value
   */
  setLines (lineIndexes, color) {
    lineIndexes.forEach(lineIndex => {
      for (let i = 0; i < this.grid.width; i++)
        this.grid.updatePixel(i, lineIndex, color)
    })
    this.grid.render()
  }

  /**
   * Return promise that will be resolved in the
   * duration provided as parameter
   * @param  {Number}  interval Duration in ms
   * @return {Promise}
   */
  waitNextFrame (interval = this.interval) {
    return new Promise(resolve => {
      setTimeout(function () {resolve()}, interval)
    })
  }
}
