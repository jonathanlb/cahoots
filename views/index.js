const configView = require('./config');
const debug = require('debug')('views');
const tallyView = require('./tally');
const yo = require('yo-yo');

exports.render = function render(viewName) {
  debug('rendering', viewName);
  yo.update(document.querySelector('#main-app'), yo`
    <div id="main-app">
      ${renderHeader()}
      <main>
        ${renderView(viewName)}
      </main>
    </div>
  `);
};

/**
 * @return Static header for the application.
 */
function renderHeader() {
  return yo`
    <header>

      <h1>Cahoots!</h1>
      <img src="raven.jpg" align="middle" height="100px" style="float:right;" />
      <br/>
      <span className="navButton"
        onclick=${() => window.app.setView('config') } >
        Configure
      </span>
      <span className="navButton" onclick=${() => console.log('Open Issues, unimplemented')} >
        Open Issues
      </span>
      <span className="navButton"
        onclick=${() => {
          window.app.reset();
          window.app.setup();
        }} >
        Reset
      </span>
    </header>
  `;
}

/**
 * @return Application state appropriate view.
 */
function renderView(viewName) {
  switch(viewName) {
    case 'config':
      return configView.render();
    case 'start':
      if (window.app.tally) {
        return yo`<div>
          ${tallyView.render(window.app.tally)}
        </div>`;
      } else {
        return yo`<div>
          <h2>Loading...</h2>
        </div>`;
      }
    default:
      return yo`<div><h3>huh....</h3></div`;
  }
}
