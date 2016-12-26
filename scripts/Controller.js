class Controller {
  constructor () {
    this.listeners = []
    this.key = null

    window.addEventListener('keydown', e => {
      if (e.keyCode === this.key)
        return
      this.key = e.keyCode
      this.listeners.forEach(listener => {
        listener && Controller.KEYS[this.key] && listener(Controller.KEYS[this.key])
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
  37: {move: 'left'},
  38: {move: 'up'},
  39: {move: 'right'},
  40: {move: 'down'},
  65: {rotate: 'left'},
  83: {rotate: 'right'},
  32: {pause: true},
  13: {start: true}
}
