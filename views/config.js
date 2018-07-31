const BallotSearch = require('../src/BallotSearch');
const debug = require('debug')('config-views');
const yo = require('yo-yo');

function showPanel(panelId, className) {
  debug('showing', panelId, className);
  if (!className) {
    className = 'hideablePanel';
  }

  let elts = document.getElementsByClassName(className);
  for (let i = elts.length - 1; i >= 0; i--) {
    let elt = elts[i];
    if (elt.id === panelId) {
      elt.style.display = 'block';
    } else {
      elt.style.display = 'none';
    }
  }
}
exports.showPanel = showPanel;

exports.render = function render() {
  return yo`
    <div className="tally" >
      <div className="leftGutterMenu">
        <h2>Issue Configurator</h2>
        <ul class="menuList" >
          <li onclick=${() => showPanel('newIssuePanel')}>
            New Issue
          </li>
          <li onclick=${() => showPanel('browseIssuePanel')}>
            Browse Issues
          </li>
          <li onclick=${() => showPanel('joinIssuePanel')}>
            Join Issue
          </li>
        </ul>
      </div>

      <div className="hideablePanel" style="display:block" id="newIssuePanel" >
        <h3>New Issue</h3>
        <label className="rightLabel" for="issueNameField" >
          Issue:
        </label>
        <span className="rightSpanner" >
          <input className="rightInput" type="text" id="issueNameField" />
        </span>
        <br/>
        <label className="rightLabel" for="participantNameField" >Participant:</label>
        <span className="rightSpanner" >
          <input className="rightInput" type="text" id="participantNameField"
            value=${localStorage.displayName || ''}/>
        </span>
        <br/>
        <input className="proposeButton"
          type="button"
          value="Start!"
          onclick=${() =>
            window.app.startNewConsensus({
              displayName: document.getElementById('participantNameField').value.trim(),
              issueName: document.getElementById('issueNameField').value.trim()
            })
          }/>
      </div>

      <div className="hideablePanel" id="browseIssuePanel" >
        <h3>Browse Issues</h3>
        <label className="rightLabel" for="datIssueUriField" >
          Ballot Directory URI:
        </label>
        <span className="rightSpanner" >
          <input type="text" id="datIssueUriField"
            className="rightInput"
            onkeyup=${(e) => {
              if (e.key == 'Enter') {
                const search = new BallotSearch();
                search.search(document.getElementById('datIssueUriField').value).
                  then(results =>
                    search.resultsTo(
                      results,
                      document.getElementById('ballotSearchResults')));
              }
            }}
            value=${window.app.datUri} />
        </span>
        <br/>
        <div id="ballotSearchResults">
        </div>
      </div>

      <div className="hideablePanel" id="joinIssuePanel"  >
        <h3>Join Issue</h3>
        <label className="rightLabel" for="datUriField" >Your ballot box:</label>
        <span className="rightSpanner" >
          <input className="rightInput" type="text" id="datUriField"
            value=${window.app.datUri}
            readonly />
        </span>
        <br/>
        <label className="rightLabel" for="configUriField" >Master ballot:</label>
        <span className="rightSpanner" >
          <input className="rightInput" type="text" id="configUriField" />
        </span>
        <br/>
        <input className="proposeButton"
          type="button"
          value="Join!"
          onclick=${() =>
            window.app.startNewConsensusFromUri(
              document.getElementById('configUriField').value.trim())
          }/>
        </div>
      </div>`;
}
