class Game {
  constructor (grid, controller, interval) {
    this.grid = grid
    this.controller = controller
    this.interval = interval

    this.currentBlock = null
    this.currentGrid = this.grid.getSplittedBinaryData()

  }

  start () {
    this.grid.clear(Launchpad.LED_OFF)
    this.pickNewBlock()
    this.controller.onKey(this.keyListener.bind(this))
    this.play()
  }

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
    if (this.moveBlock('down'))
      return
    this.cleanUp()
  }

  cleanUp () {
    var completeLines = []
    for (let line = 0; line < this.grid.height; line++) {
      if (this.grid.isLineOn(line))
        completeLines.push(line)
    }
    this.blinkAndClearLines(completeLines)
  }

  blinkAndClearLines (lineIndexes) {
    if (!lineIndexes.length) {
      this.next()
      return
    }

    this.pause()
    this
      .waitNextFrame(this.interval / 4)
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
        var newData = Array.from(this.grid.data)
        lineIndexes
          .reverse()
          .forEach(lineIndex => {
            newData.splice(lineIndex * this.grid.width, this.grid.width)
          })
        var offset = new Array(lineIndexes.length * this.grid.width)
        offset.fill(Launchpad.LED_OFF)
        this.grid.setData(offset.concat(newData))
        this.next()
        this.play()
      })

  }

  next () {
    this.currentGrid = this.grid.getSplittedBinaryData()
    this.pickNewBlock()
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




  pickNewBlock () {
    this.currentBlock = this.getRandomBlocks()
    this.currentBlock.x = Math.floor((8 - this.currentBlock.pattern[0].length) / 2)
    this.currentBlock.y = 0
    this.setPattern(this.currentBlock.color)
    this.grid.render()
  }

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

  setPattern (color) {
    for (let yIndex = 0; yIndex < this.currentBlock.pattern.length; yIndex++) {
      for (let xIndex = 0; xIndex < this.currentBlock.pattern[0].length; xIndex++) {
        if (this.currentBlock.pattern[yIndex][xIndex])
          this.grid.updatePixel(this.currentBlock.x + xIndex, this.currentBlock.y + yIndex, color)
      }
    }
  }

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

  setLines (lineIndexes, key) {
    lineIndexes.forEach(lineIndex => {
      for (let i = 0; i < this.grid.width; i++)
        // this.grid.setKey(lineIndex * this.grid.width + i, key)
        this.grid.updatePixel(i, lineIndex, key)
    })
    this.grid.render()
  }

  waitNextFrame (interval = this.interval) {
    return new Promise(resolve => {
      setTimeout(function () {resolve()}, interval)
    })
  }

}
