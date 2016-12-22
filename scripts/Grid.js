class Grid {
  constructor (launchpad, width, height) {
    this.launchpad = launchpad
    this.width     = width
    this.height    = height
    this.data      = []
    this.bufferUpdates = []
  }

  updatePixel(x, y, color) {
    let index = y * this.width + x
    if (this.data[index] !== color) {
      this.bufferUpdates.push([index, color])
    }
    return this
  }

  clear(color) {}
  reverse() {}
  setData(array) {}

  render () {
    let cmd
    for (let i = 0; i < this.bufferUpdates.length; i++) {
      cmd = this.bufferUpdates[i]
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
