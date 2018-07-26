const debug = require('debug')('App');
const Tally = require('./Tally');
const views = require('../views/index');

const BALLOT_DIR = 'ballots';

module.exports = class CahootsApp {
  /**
   */
  constructor() {
    // The location from which we read consensus participants, etc.
    this.configUri = undefined;
    // Writeable dat archive where we write our ballots.
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
   * Return the dat URI containing the configuration ballot from the window
   * location or optionally the input parameter.
   * @param optional parameter to override window.location.search
   * @return string
   */
  getConfigUriFromLocation(location) {
    const config = (location || window.location.search || '').match(/[?&]config=[^&]*/);
    if (config) {
      return config[0].substring('?config='.length);
    }
  }

  /**
   * Return a writeable dat URI from the window location or optionally the input
   * parameter.
   * @param optional parameter to override window.location.search
   * @return string
   */
  getDatUriFromLocation(location) {
    const config = (location || window.location.search || '').match(/[?&]dat=[^&]*/);
    if (config) {
      return config[0].substring('?dat='.length);
    }
  }

  /**
   * @return The display name from the ballot matching the dat URI.
   */
  getDisplayName(ballot, datUri) {
    return ((ballot.participants || []).find((entry) =>
      entry[1].startsWith(datUri)) ||
      ['???', 'dat'])[0];
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
    const app = this; // keep reference for promise, etc.

    function setDat(dat) {
      localStorage.datUri = app.datUri = dat.url;
      app.datArchive = dat;
      return dat;
    }

    function promptAndCreateLocalStorage() {
      return DatArchive.selectArchive({title: 'Local Ballot Storage'}).
        then(setDat);
    }

    function createBallotDirectory(dat) {
      setDat(dat);
      return dat.mkdir(BALLOT_DIR).
        catch((error) => {
          if (error.name === 'EntryAlreadyExistsError') {
            debug(BALLOT_DIR, 'already present');
            return dat;
          } else {
            alert(`Cannot create ballot storage:\n${error.message}`);
            return promptAndCreateLocalStorage().
              then(createBallotDirectory);
          }
        });
    }

    // setup Dat
    let promise = undefined;
    this.datUri = this.getDatUriFromLocation();
    if (!this.datUri) {
      this.datUri = localStorage.datUri;
    }
    if (!this.datUri) {
      promise = promptAndCreateLocalStorage();
    } else {
      debug('using datUri from localStorage', this.datUri);
      promise = Promise.resolve(this.datArchive = new DatArchive(this.datUri)).
        catch((error) => {
          alert(`cannot use archive ${app.datUri}\n${error.message}`);
          return promptAndCreateLocalStorage();
        });
    }
    promise = createBallotDirectory(this.datArchive);

    this.configUri = this.getConfigUriFromLocation();
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
    // check existence of ballot uri, write if necessary
    const dat = this.datArchive;
    const filePath = this.configUri.replace(/dat:\/\/[^/]*/, '');
    const fileName = filePath.replace(/.*\//, '');
    return dat.readdir(BALLOT_DIR).
      then((contents) => {
        debug('reading local ballots', contents)
        if (!contents.includes(fileName)) {
            const configDatUri = this.configUri.match(/dat:\/\/[^/]*/)[0];
            debug('copying', this.configUri, filePath, 'to', this.datUri);
            const configDat = new DatArchive(configDatUri);
            return configDat.readFile(filePath).
              then((configContents) => {
                const ballot = JSON.parse(configContents);
                ballot.displayName = this.getDisplayName(ballot, dat.url);
                ballot.chat = [];
                ballot.proposal = '';
                return dat.writeFile(filePath, JSON.stringify(ballot));
              });
        }
      }).then(() => {
        const ballotUri = `${dat.url}/${filePath}`;
        this.tally = new Tally(ballotUri,
          () => { views.render(this.currentView) });
        this.tally.start();
        this.setView('start');
      });
  }

  async startNewConsensusFromUri(configUri) {
    this.configUri = configUri;
    debug('using config uri', configUri);
    return this.start();
  }

  async startNewConsensus({displayName, issueName}) {
    localStorage.displayName = displayName;
    return this.createIssue({displayName, issueName}).
      then((uri) => this.startNewConsensusFromUri(uri)).
      catch((error) => {
        alert('DOH!\n' + error);
      })
  }

};
