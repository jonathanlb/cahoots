const debug = require('debug')('App');
const Tally = require('./Tally');
const views = require('../views/index');

module.exports = class CahootsApp {
  /**
   */
  constructor() {
    this.currentView = undefined;
    this.tally = undefined;
  }

  async createIssue({displayName, issueName}) {
    debug('createIssue', displayName, issueName);
    const dat = this.getDat();
    const fileName = this.issueNameToFile(issueName);
    const uri = `${dat.url}/${fileName}`;
    debug('creating at', uri);
    const content = {
      chat: [],
      displayName: displayName,
      issueName: issueName,
      participants: [
        [displayName, `${dat.url}/${fileName}`]
      ],
      proposal: ''
    }
    return dat.writeFile(fileName, JSON.stringify(content, null, '\t')).
      then(() => uri);
  }

  /**
   * Return the cofiguration ballot location from the window location or
   * optionally the input parameter.
   * @param optional parameter to override window.location.search
   * @return string
   */
  getBallotUri(location) {
    const config = (location || window.location.search || '').match(/[?&]ballot=[^&]*/);
    if (config) {
      return config[0].substring('?ballot='.length);
    }
  }

  getConfigUri(location) {
    const config = (location || window.location.search || '').match(/[?&]config=[^&]*/);
    if (config) {
      return config[0].substring('?config='.length);
    }
  }

  getDat() {
    // XXX remove hardcode of URI
    return new (window.DatArchive)('dat://59165ae3f038652837ccd22b137a4f66c31225d9d62aae70874afa273c32f80b');
  }

  invite(issueName) {

  }

  issueNameToFile(issueName) {
    return 'ballots/' +
      issueName.toLowerCase().
        replace(/\s/g, '_').
        replace(/[^0-9a-z\-_]/g, '') +
      '.json';
  }

  /**
   */
  async setup() {
    debug('setup');
    const configUri = this.getConfigUri();
    const ballotUri = this.getBallotUri();
    if (!ballotUri) {
      
    }

    if (configUri) {
      this.tally = new Tally(configUri,
        () => { views.render(this.currentView) });
      this.tally.start();
      return this.setView('start');
    } else {
      return this.setView('config');
    }
  }

  async startConsensus({displayName, issueName}) {
    console.log(displayName, issueName);
    return this.createIssue({displayName, issueName}).
      then((uri) => {
        this.tally = new Tally(uri,
          () => { views.render(this.currentView) });
        this.tally.start();
        this.setView('start');
      }).
      catch((error) => {
        alert('DOH!\n' + error);
      })
  }

  /**
   *
   */
  async setView(view) {
    debug('setting view', view);
    this.currentView = view;
    views.render(view);
  }
};
