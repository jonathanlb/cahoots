const debug = require('debug')('Tally');
// const errors = require('debug')('Tally:error');
const DatProposer = require('./DatProposer');
const Stopper = require('./Stopper');

module.exports = class Tally {
  /**
   * @param issueName
   * @param ballotUri a URI from which to read ballots.
   */
  constructor(ballotUri, render) {
    this.ballotUri = ballotUri;
    this.chatMessages = {};
    this.displayName = '???';
    this.issueName = '...';
    this.participantUris = {};
    this.participantNames = {};
    this.updateView = render;
    this.votes = {};
    this.watchSelf = false;

    this.stopper = new Stopper();
  }

  async chat(elt) {
    const date = new Date();
    const key = `${date.getTime()}_${this.displayName}`;
    const msg = elt.value.trim();
    this.chatMessages[key] = elt.value.trim();
    debug('chat', key, msg);
    return this.writeSelf();
  }

  createProposer() { // keep uri available
    return new DatProposer();
  }

  getChatMessages() {
    return Object.entries(this.chatMessages).
      map((entry) => {
        const key = entry[0].split('_');
        return [parseInt(key[0]), key[1], entry[1]]
      }).
      sort((a, b) => b[0] - a[0]);
  }

  getUrl(participantName) {
    if (participantName) {
      const participantUri = this.participantUris[participantName];
      return `${window.location}/?config=${this.ballotUri}&ballot=${participantUri}`;
    } else {
      return `${window.location}/?config=${this.ballotUri}&ballot=${this.ballotUri}`;
    }
  }

  getParticipantNames() {
    return Object.keys(this.participantUris);
  }

  getVotes() {
    const results = {};
    Object.values(this.votes).forEach((v) => {
      if (v !== undefined) {
        if (results[v] === undefined) {
          results[v] = 1;
        } else {
          results[v] += 1;
        }
      }
    });
    return results;
  }

  initFromBallot(ballot, uri) {
    debug('initializing from ' + uri + ' ' + ballot);
    this.displayName = ballot.displayName;
    this.register(ballot.displayName, uri);
    this.watchProposal(uri);
    this.updateFromBallot(ballot);
  }

  async invite(name, datUri, f) {
    if (!(name || '').trim().length) {
      f('ERROR: participant name is required');
      return;
    }
    let updatedName = name.trim();

    let updatedDat = (datUri || '').trim();
    if (!updatedDat.length) {
      updatedDat = this.participantUris[updatedName];
    }

    if (!(updatedDat || '').trim().length) {
      f('ERROR: participant dat is required');
      return;
    }

    const remoteBallot = this.ballotUri.replace(
      /dat:\/\/[^/]*/, updatedDat);
    if (this.register(updatedName, remoteBallot)) {
      return this.writeSelf() &&
        this.watchProposal(remoteBallot) &&
        f(`OK: ${this.getUrl(updatedName)}`);
    } else {
      f(`ERROR: duplicate user name or dat archive\n${updatedName}\n${remoteBallot}`);
    }

  }

  numParticipants() {
    return Object.values(this.participantUris).length;
  }

  parseBallot(content) {
    if (content) {
      const ballot = JSON.parse(content);
      return ballot;
    }
  }

  async propose(elt) {
    this.votes[this.displayName] = this.proposal = elt.value.trim();
    debug('propose', this.proposal);
    return this.writeSelf();
  }

  async readBallotFromUri(uri) {
    if (uri) {
      const proposer = this.createProposer(uri);
      return proposer.readBallot(uri).
        then(this.parseBallot);
    }
  }

  /**
   * Save the name and ballot URI of a user.
   * @param name the display name of the participant
   * @param uri the ballot URI of the
   * @return whether or not we registered for the first time.
   */
  register(name, uri) {
    if (this.participantUris[name] ||
      this.participantNames[uri]) {
        return false;
    } else {
      this.participantUris[name] = uri;
      this.participantNames[uri] = name;
      return true;
    }
  }

  /**
   * @return The ballot promise.
   */
  start() {
    debug('start', this.ballotUri);
    this.stopper.start();
    const ballotP = this.readBallotFromUri(this.ballotUri);
    ballotP.then((ballot) =>
      this.initFromBallot(ballot, this.ballotUri));
    return ballotP;
  }

  stop() {
    debug('stop');
    this.stopper.stop();
  }

  toJson() {
    const ourMsgRe = new RegExp(`^[0-9]+_${this.displayName}$`);
    const tsRe = /^[0-9]+/;
    return {
      'chat': Object.entries(this.chatMessages).
        filter(e => e[0].match(ourMsgRe)).
        map(e => [parseInt(e[0].match(tsRe)[0]), e[1]]),
      'displayName': this.displayName,
      'issueName': this.issueName,
      'participants': Object.entries(this.participantUris),
      'proposal': this.proposal
    };
  }

  updateChat(ballot) {
    (ballot.chat || []).forEach((timeMsg) => {
      const key = `${timeMsg[0]}_${ballot.displayName}`;
      this.chatMessages[key] = timeMsg[1];
    });
  }

  updateFromBallot(ballot) {
    debug(`update from ${ballot.displayName}`);
    if (ballot) {
      this.issueName = ballot.issueName;
      this.updateProposals(ballot);
      this.updateChat(ballot);

      if (this.updateView) {
        this.updateView();
      }
    }
  }

  /**
   * Watch one URI for a participants vote, once.
   */
  updateProposals(ballot) {
    this.votes[ballot.displayName] = ballot.proposal;

    (ballot.participants || []).map((nameUri) => {
      if (this.register(nameUri[0], nameUri[1])) {
        this.watchProposal(nameUri[1]);
      }
    });
  }

  async watchProposal(uri) {
    debug('watching', uri);
    if (uri) {
      const watcher = this.createProposer(uri);
      this.stopper.onStop(() => watcher.stop());
      watcher.watchProposal(uri, (content) => {
        if (content) { // ignore empty requests
          const ballot = this.parseBallot(content);
          return this.updateFromBallot(ballot);
        }
      });
      return watcher.readBallot(uri).
        then((content) =>
          this.parseBallot(content)).
        then((ballot) =>
          this.updateFromBallot(ballot));
    }
  }

  async writeSelf() {
    const content = this.toJson();
    const writer = this.createProposer(this.ballotUri);
    return writer.propose(this.ballotUri, content).
      then(() => this.updateView());
  }
};
