class Game {
  constructor (grid, controller, interval) {
    this.grid = grid
    this.controller = controller
    this.interval = interval

    this.currentBlock = null
    this.currentGrid = this.grid.getSplittedBinaryData()

    this.controller.onKey(this.keyListener.bind(this))
    this.pickNewBlock()
  }

  start () {
    this.grid.clear(Launchpad.LED_OFF)
    this.play()
  }

  keyListener (e) {
    switch (true) {
    case e.move:
      return this.moveBlock(e.move)
    case e.rotate:
      return this.rotateBlock(e.rotate)
    case e.pause:
      return this.pause()
    }
  }


  play () {
    if (this.timer) {
      return
    }
    this.timer = setInterval(() => {
      this.increment()
    }, this.interval)
  }

  pause () {
    clearInterval(this.timer)
    this.timer = null
  }

  increment () {
    if (this.move('down'))
      return
    this.cleanUp()
  }

  cleanUp () {
    var completeLines = []
    for (let line = 0; line < this.grid.height; line++) {
      if (this.gris.isLineOff(line))
        completeLines.push(line)
    }
    this.blinkAndClearLines(completeLines)
  }

  blinkAndClearLines (lineIndexes) {
    if (!lineIndexes.length)
      return

    this.pause()
    this
      .waitNextFrame(this.interval / 4)
      .then(() => {
        this.setLines(lineIndexes, launchpad.LED_GREEN_FULL)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        this.setLines(lineIndexes, launchpad.LED_YELLOW)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        this.setLines(lineIndexes, launchpad.LED_AMBER_FULL)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        this.setLines(lineIndexes, launchpad.LED_RED_FULL)
        return this.waitNextFrame(this.interval / 4)
      })
      .then(() => {
        var newData = Array.from(this.grid.data)
        lineIndexes
          .reverse()
          .forEach(function (lineIndex) {
            newData.splice(lineIndex * this.grid.width, this.grid.width)
          })
        var offset = new Array(lineIndexes.length * this.grid.width)
        offset.fill(Launchpad.LED_OFF)
        this.grid.setData(offset.concat(newData))
        this.currentGrid = this.grid.getSplittedBinaryData()
        this.pickNewBlock()
        this.play()
      })

  }


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
      this.setPattern(block.color)
      this.grid.render()
    }
    else {
      this.grid.clearBuffer()
    }

    return isSuccess
  }

  pickNewBlock () {
    this.currentBlock = this.getRandomBlocks()
    this.currentBlock.posX = 8 - Math.floor(this.currentBlock.pattern[0].length / 2)
    this.currentBlock.poxY = 0
  }

  doesPatternFit (pattern, x, y) {
    if (x < 0 || (x + pattern[0].length) >= 8 || y < 0 || (y + pattern.length) >= 8)
      return false

    for (let yIndex = 0; yIndex < pattern.length; yIndex++) {
      for (let xIndex = 0; xIndex < pattern[0].length; xIndex++) {
        if (pattern[yIndex][xIndex] && this.currentGrid[y + yIndex][x + xIndex])
          return false
      }
    }
    return true
  }

  setPattern (color) {
    for (let yIndex = 0; yIndex < this.currentBlock.pattern.length; yIndex++) {
      for (let xIndex = 0; xIndex < this.currentBlock.pattern[0].length; xIndex++) {
        if (this.currentBlock.pattern[yIndex][xIndex])
          this.updatePixel(this.currentBlock.x + xOffset, this.currentBlock.y + yOffset, color)
      }
    }
  }

  getRandomBlocks () {
    var blocks = [
      {
        color: Launchpad.LED_YELLOW,
        pattern:[
          [1, 1, 1],
          [1, 0, 0]
        ]
      },
      {
        color: Launchpad.LED_RED_FULL,
        pattern:[
          [1, 1],
          [1, 1]
        ]
      },
      {
        color: Launchpad.LED_AMBER_FULL,
        pattern:[
          [0, 1, 1],
          [1, 1, 0]
        ]
      },
      {
        color: Launchpad.LED_YELLOW,
        pattern:[
          [1, 1, 1],
          [0, 1, 0]
        ]
      }
    ]
    return blocks[Math.floor(Math.random() * blocks.length)]
  }

  setLines (lineIndexes, key) {
    lineIndexes.forEach(lineIndex => {
      for (let i = 0; i < this.grid.width; i++)
        this.grid.setKey(lineIndex * this.grid.width + i, key)
    })
    this.grid.render()
  }

  waitNextFrame () {
    return new Promise(function (resolve) {
      setTimeout(function () {resolve()}, this.interval)
    })
  }

}
