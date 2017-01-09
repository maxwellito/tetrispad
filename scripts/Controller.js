/**
 * Controller class
 * Wrapper to listen to keyboard events and
 * dispatch formatted events for the Game
 * class
 */
class Controller {
  constructor () {
    this.listeners = []
    this.key = null

    // Listener for keydown event
    // The formatted event is dispatched only
    // the key is valid
    window.addEventListener('keydown', e => {
      if (e.keyCode === this.key)
        return
      this.key = e.keyCode
      this.listeners.forEach(listener => {
        listener && Controller.KEYS[this.key] && listener(Controller.KEYS[this.key])
      })
    })
    // Prevent infinite keydown event on a key
    // This listener force a key to be released before
    // being listened again
    window.addEventListener('keyup', e => {
      this.key = null
    })
  }

  /**
   * Method to start listening on a key event
   * @param  {function} listener Listener to call
   * @return {function}          Function to stop listening
   */
  onKey (listener) {
    var listenerIndex = this.listeners.length
    this.listeners.push(listener)

    return function () {
      this.listeners[listenerIndex] = null
    }
  }

  /**
   * Add listen a launchpad for messages
   * @param {[type]} launchpad [description]
   */
  addLaunchpad (launchpad) {
    launchpad.onMessage(data => {
      console.log(data)
      if (!data[2]) {
        return
      }
      var key = Controller.LAUNCHPAD_KEYS[data[1]] || {pause: true}
      this.listeners.forEach(listener => {
        listener && listener(key)
      })
    })
  }
}

/**
 * List of accept keys and their event data
 * @type {Object}
 */
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

Controller.LAUNCHPAD_KEYS = {
  112: {move: 'left'},
  114: {move: 'down'},
  113: {move: 'right'},
  118: {rotate: 'left'},
  119: {rotate: 'right'}
}
