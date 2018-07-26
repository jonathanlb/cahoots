const Tally = require('../src/Tally');
const shell = require('shelljs');

/**
 * Create a new tally backed by a file in a temporary directory.
 */
function createTally() {
  const tmp = require('tmp');
  tmp.setGracefulCleanup();
  const tmpDir = tmp.dirSync({unsafeCleanUp: true});
  shell.cp('./tests/sample-ballot.json', tmpDir.name);
  return new Tally(`${tmpDir.name}/sample-ballot.json`);
}

test('gets the ballot URL', () => {
  const ballot = 'dat://aced';
  const fileName = '/ballots/sample-ballot.json';
  const url = `${ballot}${fileName}`;
  const tally = new Tally(url);
  expect(tally.getUrl()).toEqual(
    `about:blank/?config=${ballot}${fileName}&ballot=${ballot}${fileName}`);
});

test('gets the ballot URL for a participant', () => {
  const ballot = 'dat://aced';
  const config = 'dat://1234';
  const fileName = '/ballots/sample-ballot.json';
  const url = `${config}${fileName}`;
  const tally = new Tally(url);
  tally.register('Jonathan', `${ballot}${fileName}`);
  expect(tally.getUrl('Jonathan')).
    toEqual(`about:blank/?config=${config}${fileName}&ballot=${ballot}${fileName}`);
});

test('instantiate', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  expect(tally).toBeDefined();
  tally.stop(); // coverage
});

test('initializes from ballot', () => {
  const uri = './tests/sample-ballot.json';
  const name = 'Mattie';
  let rendered = false;
  function render() {
    rendered = true;
    expect(tally.displayName).toEqual(name);
  }
  const tally = new Tally(uri, render);
  const anotherName = 'Lily';
  const ballot = {
    chat: [ ],
    displayName: name,
    issueName: 'chew',
    participants: [[name, uri], [anotherName, 'another-file']],
    proposal: 'wooof'
  }

  const ballotUris = new Set();
  tally.watchProposal = (uri) => ballotUris.add(uri);
  let written = false;
  tally.writeSelf = () => written = true;
  tally.initFromBallot(ballot, uri);
  expect(rendered).toBe(true);
  expect(ballotUris).toEqual(new Set([uri, 'another-file']));
  expect(tally.numParticipants()).toBe(2);
  expect(new Set(tally.getParticipantNames())).
    toEqual(new Set([name, anotherName]));
});

test('invites a participant', () => {
  const url = 'dat://abcd/ballots/sample-ballot.json';
  const tally = new Tally(url);
  let result = '';
  tally.invite('Jonathan', 'dat://a11ebaba', (msg) => { result = msg; });
  expect(result.substring(0,4)).toEqual('OK: ');
  expect(result.includes('ballot=dat://a11ebaba')).toBe(true);
  expect(result.includes('config=dat://abcd/ballots/sample-ballot.json')).toBe(true);
});

test('registers once', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  expect(tally.register('Bob', 'dat://....')).toBe(true);
  expect(tally.register('Bob', 'dat://....')).toBe(false);
  expect(tally.register('Alice', 'dat://....')).toBe(false);
  expect(tally.register('Alice', 'file://....')).toBe(true);
});

test('responds to chat updates', async () => {
  const tally = new Tally('./tests/sample-ballot.json');
  tally.displayName = 'Mattie';
  const element = {
    value: ' Woof! '
  }
  let written = false;
  tally.writeSelf = () => {
    written = true;
  }
  await tally.chat(element);
  expect(tally.getChatMessages().map(e => [e[1], e[2]])).
    toEqual([['Mattie', 'Woof!']]);
  expect(written).toBe(true);
});

test('responds to propose updates', async () => {
  const tally = new Tally('./tests/sample-ballot.json');
  tally.displayName = 'Mattie';
  const element = {
    value: ' Woof now woof! '
  }
  let written = false;
  tally.writeSelf = () => {
    written = true;
  }
  await tally.propose(element);
  expect(tally.proposal).toEqual('Woof now woof!');
  expect(tally.getVotes()).toEqual({'Woof now woof!': 1});
  expect(written).toBe(true);
});

test('stores and retrieves chat messages', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  const name = 'Mattie';
  tally.displayName = name;

  const ballot = {
    chat: [
      [1, 'woof!'],
      [2, 'slurp']
    ],
    displayName: name,
    issueName: 'chew',
    participants: [[name, 'file'], [anotherName, 'another-file']]
  };
  tally.updateChat(ballot);

  const anotherName = 'Lily';
  const anotherBallot = {
    chat: [
      [3, 'hmph'],
    ],
    displayName: anotherName,
    issueName: 'chew',
    participants: ballot.participants
  };
  tally.updateChat(anotherBallot);

  const msgs = tally.getChatMessages();
  expect(msgs).toEqual([
    [3, anotherName, 'hmph'],
    [2, name, 'slurp'],
    [1, name, 'woof!']]);
  expect(tally.toJson().chat).toEqual([
    [1, 'woof!'],
    [2, 'slurp']]);
});

test('sums defined votes', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  tally.votes = {
    'Jonathan': 'walk',
    'Mattie': 'walk'
  };
  tally['Lily'] = undefined;
  expect(tally.getVotes()).toEqual({'walk': 2});
});

test('sums votes', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  tally.votes = {
    'Lily': 'sleep',
    'Jonathan': 'walk',
    'Mattie': 'walk'
  };
  expect(tally.getVotes()).toEqual({'sleep': 1, 'walk': 2});
});
/*
test('update ballot', async () => {
  const tally = new Tally('./tests/sample-ballot.json');
  const ballot = await tally.start();
  expect(tally.numParticipants()).toEqual(3);
  expect(tally.getVotes()).toEqual({'Walk before eat': 1});

  ballot.proposal = 'Eat now';
  tally.updateFromBallot(ballot);
  expect(tally.getVotes()).toEqual({'Eat now': 1});

  tally.updateFromBallot({
    displayName: 'Lily',
    proposal: 'Eat now'
  });

  tally.updateFromBallot({
    displayName: 'Mattie',
    proposal: 'Woof'
  });

  expect(tally.getVotes()).toEqual({
    'Eat now': 2,
    'Woof': 1
  });
  tally.stop();
});
*/

/*
test('update proposal', async () => {
  const tally = createTally();
  await tally.start();

  const proposal = tally.proposal;
  const name = tally.displayName;
  const proposalElt = {
    value: 'Pass the test'
  };

  await tally.propose(proposalElt);
  tally.stop();
  expect(tally.proposal).toEqual('Pass the test');

  // make sure we don't clobber the ballot file
  const tallyBackup = new Tally(tally.ballotUri);
  await tallyBackup.start();
  tallyBackup.stop();
  expect(tallyBackup.proposal).toEqual(proposal);
});
*/
