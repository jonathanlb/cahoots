const debug = require('debug')('tally-views');
const yo = require('yo-yo');

exports.render = function render(tally) {
  return yo`
    <div className="tally" >
      <h2><a href="${tally.getUrl()}">${tally.issueName}</a></h2>
      ${renderTally(tally)}
    </div>`;
};

function renderTally(tally) {
  const participants =
    yo`<div className="participants" >
      <h3>Participants:</h3>
      ${tally.getParticipantNames().
        sort().
        map((name) => {
          return yo`<div className="participant" >
            ${name}
          </div>`; // TODO boldface our name
        })}</div>`;
  const votes =
    yo`<div className="votes" >
      ${Object.entries(tally.getVotes()).
        sort((a, b) => { return a[1] - b[1]; }).
        map((e) => {
          return yo`<div className="vote" >
            <b>${e[1]}:</b> ${e[0]}
          </div>`;
        })}</div>`;
  const proposal =
    yo`<div className="proposal" >
      <h3>Proposal:</h3>
      <textarea className="freeFormText"
        id="proposalField"
        onkeyup=${(e)=> {
          if (e.key == 'Enter') {
            tally.propose(e.target);
          }
        }} >${tally.proposal}</textarea>
      <br/>
      <input className="proposeButton"
        type="button"
        onclick=${()=>
          tally.propose(document.getElementById('proposalField'))
        }
        value="Propose!" />
    </div>`;

  const messages =
    yo`<div className="chat" >
      <h3>Chatter:</h3>
      <textarea className="freeFormText"
        onkeyup=${(e)=> {
          if (e.key == 'Enter') {
            tally.chat(e.target);
          }
        }} ></textarea>
      <div className="chatMessages" >
        ${tally.getChatMessages().
          map((tsNameMsg) => {
            const date = new Date(tsNameMsg[0]);
            const ts = date.toLocaleString();
            return yo`<div className="chatMessage">
              ${ts} <b>${tsNameMsg[1]}:</b> <i>${tsNameMsg[2]}</i>
              </div>`;
          })}
      </div>
    </div>`;

  const invite =
    yo`<div className="participants" >
        <h3><a href="${tally.getUrl()}">Invite:</a></h3>
        <form>
          <div>
            <label for="inviteNameField">Invitee Name:</label>
            <input type="text" id="inviteNameField"></input>

            <label for="inviteDatField">Dat URI:</label>
            <input type="text" id="inviteDatField"></input>
            <input className="proposeButton"
              type="button"
              value="Invite" />
          <div>
        </form>
      </div>`;

  return [
    yo`<div className="proposalGrouping" >
      ${[participants, votes, proposal]}
    </div>`,
    yo`<div className="proposalGrouping" >
      ${[invite, messages]}
    </div>`];
}
