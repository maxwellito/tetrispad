class Grid {
  constructor (launchpad, width, height) {
    this.launchpad = launchpad
    this.width     = width
    this.height    = height

    this.clear(Launchpad.LED_OFF)
    this.bufferUpdates = []
  }

  updatePixel(x, y, color) {
    let index = y * this.width + x
    if (this.data[index] !== color) {
      this.bufferUpdates.push([index, color])
    }
    return this
  }

  clear(color) {
    this.data = new Array(this.width * this.height)
    this.data.fill(color)
    this.launchpad.clear(color)
  }
  
  reverse() {}
  setData(array) {}

  render () {
    let cmd,
        keysUpdated = []
    for (let i = this.bufferUpdates.length - 1; i >= 0; i++) {
      cmd = this.bufferUpdates[i]
      if (!~keysUpdated.indexOf(cmd[0]))
        continue
      keysUpdated.push(cmd[0])
      this.setKey(this.indexToKey(cmd[0]), cmd[1])
      this.data[cmd[0]] = cmd[1]
    }
    this.bufferUpdates = []
    return this
  }

  indexToKey (index) {
    return Math.floor(index / this.width) * 16 + (index % this.width)
  }
}
