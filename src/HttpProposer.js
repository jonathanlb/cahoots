const debug = require('debug')('HttpProposer');
const errors = require('debug')('HttpProposer:error');
const requestP = require('request-promise');

module.exports = class HttpProposer {
  constructor() {
    this.stopped = false;
  }

  async propose(uri, content) {
    alert('Updates not supported in HTTP mode');
  }

  /**
   * Load a ballot from a URI.
   * @param uri target to read
   * @return promise of JSON text input to be parsed
   */
  async readBallot(uri) {
    return requestP(uri).
      catch((error) => {
        if (error.statusCode == 404) {
          debug(`no vote at ${uri}`);
        } else {
          errors(`cannot read ${uri}`, error.message);
        }
      });
  }

  stop() {
    this.stopped = true;
    debug('stop');
  }

  async watchProposal(uri, update) {
    const missingUriPollMS = 30 * 1000;
    if (!this.stopped) {
      try {
        this.readBallot(uri).
          then((ballot) => update(ballot));
      } catch (error) {
        errors('Cannot watch ' + uri, error.message);
      }
      setTimeout(
        () => this.watchProposal(uri, update),
        missingUriPollMS);
    }
  }
}
