class Controller {
  constructor () {
    this.listeners = []
    this.key = null

    window.addEventListener('keydown', e => {
      if (e.keyCode === this.key)
        return
      this.key = e.keyCode
      this.listeners.forEach(listener => {
        listener && listener({
          move: Controller.KEYS[this.key]
        })
      })
    })
    window.addEventListener('keyup', e => {
      this.key = null
    })
  }

  onKey (listener) {
    var listenerIndex = this.listeners.length
    this.listeners.push(listener)

    return function () {
      this.listeners[listenerIndex] = null
    }
  }
}

Controller.KEYS = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}
