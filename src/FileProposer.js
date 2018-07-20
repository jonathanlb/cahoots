const debug = require('debug')('FileProposer');
const errors = require('debug')('FileProposer:error');

module.exports = class FileProposer {
  constructor() {
    this.fsWatchers = [];
    this.stopped = false;
  }

  async propose(uri, content) {
    return require('fs').
      promises.
      writeFile(uri, JSON.stringify(content, null, '\t')).
      catch(e => errors('propose', e));
  }

  /**
   * Load a ballot from a URI.
   * @param uri target to read
   * @return promise of JSON text input to be parsed
   */
  async readBallot(uri) {
    return require('fs').
      promises.
      readFile(uri);
  }

  stop() {
    debug('stop');
    this.stopped = true;
    this.fsWatchers.forEach((f) => {
      if (f) {
        f.close();
      }
    });
    this.fsWatchers = [];
  }

  async watchProposal(uri, update) {
    if (this.stopped) {
      return;
    }

    const missingFilePollMS = 10*1000;
    const fs = require('fs');
    let watcher = undefined;
    try {
      watcher = fs.watch(uri, () => { // (eventType, fileName)
        this.readBallot(uri).
          then((ballot) => update(ballot));
      });
      this.fsWatchers.push(watcher);
    } catch (error) {
      errors('Cannot watch ' + uri + ' .... retrying', error.message);
      this.fsWatchers.splice(
        this.fsWatchers.indexOf(watcher));
      if (watcher) {
        watcher.close();
      }
      setTimeout(() => this.watchFile(uri), missingFilePollMS);
    }
  }
}
