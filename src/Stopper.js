// const debug = require('debug')('Stopper');
const errors = require('debug')('Stopper:error');

module.exports = class Stopper {
  constructor() {
    this.stopped = false;
    this.toStop = [];
  }

  isStopped() {
    return this.stopped;
  }

  onStop(f) {
    this.toStop.push(f);
  }

  start() {
    this.stopped = false;
  }

  stop() {
    this.stopped = true
    this.toStop.forEach(f => {
      try {
        f();
      } catch (error) {
        errors('stopping', error);
      }
    });
  }
}
