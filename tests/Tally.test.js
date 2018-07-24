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

/*
test('read ballot file input', async () => {
  const tally = new Tally('./tests/sample-ballot.json');
  const ballot = await tally.start();
  expect(ballot.displayName).toEqual('Jonathan');
  expect(ballot.issueName).toEqual('lunch');
  tally.stop();
});
*/

test('registers once', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  expect(tally.register('Bob', 'dat://....')).toBe(true);
  expect(tally.register('Bob', 'dat://....')).toBe(false);
  expect(tally.register('Alice', 'dat://....')).toBe(false);
  expect(tally.register('Alice', 'file://....')).toBe(true);
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
test('update chat', async () => {
  const tally = createTally();
  await tally.start();
  const proposal = tally.proposal;
  const name = tally.displayName;
  const chatElt = {
    value: 'Hello, World'
  };

  function stripTimeStamps(chats) {
    return new Set(
      Object.entries(chats).
        map(kv => [kv[0].replace(/^[0-9]*_/, ''), kv[1]]));
  }

  await tally.chat(chatElt);
  tally.stop();

  expect(tally.displayName).toEqual(name);
  expect(tally.proposal).toEqual(proposal);

  const expectedMessages = new Set([
    ['Jonathan', 'ideas?'], ['Jonathan', 'Hello, World']
  ]);
  expect(stripTimeStamps(tally.chatMessages)).
    toEqual(expectedMessages);

  // make sure we don't clobber the ballot file
  const tallyBackup = new Tally(tally.ballotUri);
  await tallyBackup.start();
  tallyBackup.stop();
  expect(tallyBackup.proposal).toEqual(proposal);
  expect(stripTimeStamps(tallyBackup.chatMessages)).
    toEqual(expectedMessages);
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
