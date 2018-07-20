const debug = require('debug')('config-views');
const yo = require('yo-yo');

exports.render = function render() {
  return yo`
    <div className="tally" >
      <h2>Issue Configurator</h2>
      <form>
        <h3>New Issue</h3>
        <label for="issueNameField" >Issue:</label>
        <input type="text" id="issueNameField" />
        <br/>
        <label for="participantNameField" >Participant:</label>
        <input type="text" id="participantNameField" />
        <br/>
        <input className="proposeButton"
          type="button"
          value="Start!"
          onclick=${() =>
            window.app.startConsensus({
              displayName: document.getElementById('participantNameField').value.trim(),
              issueName: document.getElementById('issueNameField').value.trim()
            })
          }/>
      </form>

      <form>
        <h3>Existing Issue</h3>
        <label for="configUriField" >URI:</label>
        <input type="text" id="configUriField" />
        <br/>
        <input className="proposeButton"
          type="button"
          value="Join!"
          onclick=${() =>
            window.app.startConsensusFromUri({
              displayName: document.getElementById('configUriField').value.trim()
            })
          }/>
        </form>
      </div>`;
}
