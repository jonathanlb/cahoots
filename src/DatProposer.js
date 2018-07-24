const debug = require('debug')('DatProposer');
const errors = require('debug')('DatProposer:error');
const Stopper = require('./Stopper');

module.exports = class DatProposer {
  constructor() {
    this.stopper = new Stopper();
  }

  /**
   * Create a Dat archive for the URI.
   * @param uri string of name of the archive, optionally with file name.
   * @param f optional (err x dat) => void function to pass to Dat constructor.
   */
  getDat(uri, f) {
    const { volume } = this.splitUri(uri);
    let dat = undefined;
    if (window.DatArchive === undefined) {
      // not working -- versioning with dat-gateway?
      // debug('using dat-archive-web', uri);
      // dat = require('dat-archive-web');
      // dat.setManager(new dat.DefaultManager('127.0.0.1:3000'));
      throw new Error('operation from non-Beaker browser not supported');
    } else {
      debug('using window.DatArchive', uri);
      dat = window.DatArchive;
    }
    return new dat(volume, f);
  }

  async propose(uri, content) {
    const { volume, fileName } = this.splitUri(uri);
    debug('writing', uri);
    return this.getDat(volume).
      writeFile(fileName, JSON.stringify(content, null, '\t')).
      catch(e => errors('propose', e));
  }

  /**
   * Load a ballot from a URI.
   * @param uri target to read
   * @return promise of JSON text input to be parsed
   */
  async readBallot(uri) {
    const { volume, fileName } = this.splitUri(uri);
    return this.getDat(volume).
      readFile(fileName);
  }

  splitUri(uri) {
    const volume = uri.match(/^[a-z]*:\/\/[^/]*/)[0];
    const fileName = uri.substring(volume.length);
    return { volume, fileName };
  }

  stop() {
    debug('stop');
    this.stopper.stop();
  }

  watchProposal(uri, update) {
    const { volume, fileName } = this.splitUri(uri);
    debug('setup watch', volume, fileName);
    const dat = this.getDat(volume);
    const eventTarget = dat.watch(fileName);
    this.stopper.onStop(() => {
      debug('closing watch', uri);
      eventTarget.close()
    });
    eventTarget.addEventListener('changed', (path) => {
      debug(path, 'updated');
      dat.readFile(fileName).
        then(update).
        catch((error) =>
          errors('watching for update', uri, error));
    });
  }
}
