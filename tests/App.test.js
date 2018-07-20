const App = require('../src/App.js');

test('gets default configuration', () => {
  const app = new App();
  const uri = app.getConfigUriFromLocation('dat://1234/dist/index.html');
  expect(uri).toBeUndefined();
});

test('gets a dat configuration', () => {
  const app = new App();
  const uri = app.getConfigUriFromLocation(
    'http://frodo.com:9090/index.html?config=dat://abcdef1234/ballot.json');
  expect(uri).toEqual('dat://abcdef1234/ballot.json');
});

test('gets default ballot', () => {
  const app = new App();
  const uri = app.getBallotUriFromLocation('dat://1234/dist/index.html');
  expect(uri).toBeUndefined();
});

test('gets a dat configuration', () => {
  const app = new App();
  const uri = app.getBallotUriFromLocation(
    'http://frodo.com:9090/index.html?config=dat://abcdef1234/master.json&ballot=dat://1234/ballot.json');
  expect(uri).toEqual('dat://1234/ballot.json');
});
