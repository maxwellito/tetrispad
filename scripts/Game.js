class Game {
  constructor (grid, controller, interval) {
    this.grid = grid
    this.controller = controller
    this.interval = interval

    this.currentPiece = null

    this.controller.onKey(this.keyListener.bind(this))
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
    if (this.move('down')) {
      return
    }
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
    if (!lineIndexes.length) {
      return
    }
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
        this.play()
      })

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


Game.blocks = [
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
