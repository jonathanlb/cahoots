const debug = require('debug')('App');
const Tally = require('./Tally');
const views = require('../views/index');

const BALLOT_DIR = 'ballots';

module.exports = class CahootsApp {
  /**
   */
  constructor() {
    // The location to which we can write our proposal and invites.
    this.ballotUri = undefined;
    // The location from which we read consensus participants, etc.
    this.configUri = undefined;
    this.datArchive = undefined;
    // view name for yo-yo rendering.
    this.currentView = undefined;
    this.tally = undefined;
  }

  async createIssue({displayName, issueName}) {
    debug('createIssue', displayName, issueName);
    const dat = this.datArchive;
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
  getBallotUriFromLocation(location) {
    const config = (location || window.location.search || '').match(/[?&]ballot=[^&]*/);
    if (config) {
      return config[0].substring('?ballot='.length);
    }
  }

  getConfigUriFromLocation(location) {
    const config = (location || window.location.search || '').match(/[?&]config=[^&]*/);
    if (config) {
      return config[0].substring('?config='.length);
    }
  }

  issueNameToFile(issueName) {
    return `${BALLOT_DIR}/${
      issueName.toLowerCase().
        replace(/\s/g, '_').
        replace(/[^0-9a-z\-_]/g, '')
      }.json`;
  }

  /**
   * Get the consensus configuration from the URL, local storage, or prompt
   * the user.
   */
  async setup() {
    debug('setup');
    this.configUri = this.getConfigUriFromLocation();
    this.ballotUri = this.getBallotUriFromLocation();

    let promise = undefined;
    if (this.ballotUri) {
      debug('using ballot uri', this.ballotUri);
      this.datArchive = new DatArchive(this.ballotUri);
      promise = Promise.resolve(this.datArchive);
    } else {
      // Do we have to interrupt the user for this?
      promise = DatArchive.create({title: 'Local Ballot Storage'}).
        then((dat) => {
          this.datArchive = dat;
          debug('using ballot uri', this.ballotUri);
          this.ballotUri = dat.url;
          return dat.mkdir(BALLOT_DIR).
            catch((error) => {
              if (error.name === 'EntryAlreadyExistsError') {
                debug(BALLOT_DIR, 'already present');
                return dat;
              } else {
                throw error;
              }
            });
        });
    }

    if (this.configUri) {
      debug('using config uri', this.configUri);
      promise = promise.then(() => {
        return this.start();
      });
    } else {
      promise = promise.then(() => {
        return this.setView('config');
      });
    }

    return promise;
  }

  /**
   *
   */
  async setView(view) {
    debug('setting view', view);
    this.currentView = view;
    return views.render(view);
  }

  /**
   * Create the tally and set the view to the application polling.
   * Do not call this until all initialization completes.
   */
  async start() {
    debug('start');
    this.tally = new Tally(this.configUri,
      () => { views.render(this.currentView) });
    this.tally.start();
    this.setView('start');
  }

  async startConsensusFromUri(configUri) {
    this.configUri = configUri;
    debug('using config uri', configUri);
    return this.start();
  }

  async startConsensus({displayName, issueName}) {
    return this.createIssue({displayName, issueName}).
      then((uri) => this.startConsensusFromUri(uri)).
      catch((error) => {
        alert('DOH!\n' + error);
      })
  }

};
