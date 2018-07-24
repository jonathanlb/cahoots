const App = require('../src/App.js');

test('can create an issue', async () => {
  let contentWritten = '';
  let fileNameUsed = '';

  const app = new App();
  app.datArchive = {
    url: 'dat://abcd',
    writeFile: async (fileName, content) => {
      contentWritten = content;
      fileNameUsed = fileName;
      return '';
    }
  }

  const writeResponse = await app.createIssue({
    displayName: 'Frodo',
    issueName: 'elevensies now'
  });
  expect(fileNameUsed).toEqual('ballots/elevensies_now.json');
  contentWritten = JSON.parse(contentWritten);
  expect(contentWritten.displayName).toEqual('Frodo');
  expect(contentWritten.chat.length).toBe(0);
  expect(contentWritten.issueName).toEqual('elevensies now');
  expect(contentWritten.proposal).toEqual('');
  expect(contentWritten.participants).toEqual(
    [['Frodo', 'dat://abcd/ballots/elevensies_now.json']]);
});

test('gets default configuration', () => {
  const app = new App();
  const uri = app.getConfigUriFromLocation('dat://1234/dist/index.html');
  expect(uri).toBeUndefined();
});

test('gets display name from a ballot', () => {
  const app = new App();
  const datUri = 'dat://bababa';
  const ballot = {
    participants: [
      ['Bilbo', 'dat://aaaaaa'],
      ['Frodo', datUri]
    ]
  };
  let found = app.getDisplayName(ballot, datUri);
  expect(found).toBe('Frodo');
  found = app.getDisplayName(ballot, 'XXX');
  expect(found).toBe('???');
});

test('gets a dat configuration', () => {
  const app = new App();
  const uri = app.getConfigUriFromLocation(
    'http://frodo.com:9090/index.html?config=dat://abcdef1234/ballot.json');
  expect(uri).toEqual('dat://abcdef1234/ballot.json');
});

test('gets default ballot', () => {
  const app = new App();
  const uri = app.getDatUriFromLocation('dat://1234/dist/index.html');
  expect(uri).toBeUndefined();
});

test('gets a dat configuration', () => {
  const app = new App();
  const uri = app.getDatUriFromLocation(
    'http://frodo.com:9090/index.html?config=dat://abcdef1234/master.json&dat=dat://1234');
  expect(uri).toEqual('dat://1234');
});

test('translates issue to file names', () => {
  const app = new App();
  expect(app.issueNameToFile('some 1st-Issue')).
    toEqual('ballots/some_1st-issue.json');
});
