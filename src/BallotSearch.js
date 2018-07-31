const App = require('./App');
const debug = require('debug')('BallotSearch');
const yo = require('yo-yo');

const BALLOT_DIR = '/ballots';

module.exports = class BallotSearch {
  constructor () {
    this.ballotUri = undefined;
  }

  getDat(url) {
    return new DatArchive(url);
  }

  static lastActive(issue) {
    debug('last active', issue);
    const timeStampMillis = (issue.chat || []).map(e => e[0]);
    if (issue.createdMillis) {
      timeStampMillis.push(issue.createdMillis);
    }
    const lastChat = Math.max(...timeStampMillis);
    if (lastChat > 0) {
      return (new Date(lastChat)).toLocaleString();
    } else {
      return '???';
    }
  }

  link(ballotUri, issue) {
    const baseUrl = window.location.
      toString().
      replace('/index.html', '').
      replace(/\/\?.*/, '');
    const fileName = App.issueNameToFile(issue.issueName).
      replace(/.*\//, ''); // we're reading files under the directory already.
    return `${baseUrl}/?config=${ballotUri}/${fileName}`;
  }

  async search(ballotUri) {
    debug('search', ballotUri);
    this.ballotUri = ballotUri;
    const dat = this.getDat(ballotUri);
    return dat.readdir(BALLOT_DIR).
      then((ls) =>
        Promise.all(ls.filter(entry =>
          entry.endsWith('.json')).
          map((entry) =>
            dat.readFile(`/${BALLOT_DIR}/${entry}`).
              then(contents =>
                JSON.parse(contents)))));
  }

  resultsTo(results, resultElt) {
    debug('results', results, resultElt);
    let resultHtml = undefined
    if (results.length) {
      resultHtml = yo`<div id=${resultElt.id} className=${resultElt.className} >
        <table>
          <tr><th>Title</th><th>#Voters</th><th>Last Active</th></tr>
          ${results.map(issue =>
            yo`<tr><td><a href="${this.link(this.ballotUri, issue)}">
              ${issue.issueName}</a></td>
              <td>${(issue.participants || []).length}</td>
              <td>${BallotSearch.lastActive(issue)}</td></tr>`)}
        </table></div>`;
    } else {
      resultHtml = yo`<div id=${resultElt.id} className=${resultElt.className} >
        No ballots found at ${this.ballotUri}
        </div>`;
    }
    yo.update(resultElt, resultHtml);
    return this;
  }
};
