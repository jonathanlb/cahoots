const debug = require('debug')('config-views');
const yo = require('yo-yo');

exports.render = function render() {
  return yo`
    <div className="tally" >
      <h2>Issue Configurator</h2>
      ${location.href}
      <form>
        Issue: <input type="text" id="issueNameField" /> <br/>
        Participant: <input type="text" id="participantNameField" /> <br/>
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
    </div>`;
}
