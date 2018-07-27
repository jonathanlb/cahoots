const debug = require('debug')('config-views');
const yo = require('yo-yo');

exports.render = function render() {
  return yo`
    <div className="tally" >
      <h2>Issue Configurator</h2>
      <div className="tally" >
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

      <div className="tally" >
        <h3>Existing Issues</h3>
        <label className="rightLabel" for="datIssueUriField" >
          Dat:
        </label>
        <span className="rightSpanner" >
          <input type="text" id="datIssueUriField"
            className="rightInput"
            value=${window.app.datUri} />
        </span>
      </div>

      <div className="tally" >
        <h3>Join Issue</h3>
        <label className="rightLabel" for="datUriField" >Writeable Dat:</label>
        <span className="rightSpanner" >
          <input className="rightInput" type="text" id="datUriField"
            value=${window.app.datUri}
            readonly />
        </span>
        <br/>
        <label className="rightLabel" for="configUriField" >URI:</label>
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
