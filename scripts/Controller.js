class Controller {
  constructor () {
    this.listerners = []
    this.key = null

    window.addEventListener('keydown', e => {
      if (e.keyCode === this.key)
        return
      this.key = e.keyCode
      this.listerners.forEach(listener => {
        listener || listener({
          move: Controller.KEYS[this.key]
        })
      })
    })
    window.addEventListener('keyup', e => {
      this.key = null
    })
  }

  onKey (listener) {
    var listenerIndex = this.listener.length
    this.listerners.push(listener)

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
