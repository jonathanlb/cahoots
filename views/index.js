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
    <header><h1>Cahoots!</h1></header>
  `;
}

/**
 * @return Application state appropriate view.
 */
function renderView(viewName) {
  switch(viewName) {
    case 'config':
      return configView.render();
      break;
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
      break;
    default:
      return yo`<div><h3>huh....</h3></div`;
  }
}
