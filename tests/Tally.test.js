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

test('instantiate', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  expect(tally).toBeDefined();
});

test('read ballot file input', async () => {
  const tally = new Tally('./tests/sample-ballot.json');
  const ballot = await tally.start();
  expect(ballot.displayName).toEqual('Jonathan');
  expect(ballot.issueName).toEqual('lunch');
  tally.stop();
});

test('registers once', () => {
  const tally = new Tally('./tests/sample-ballot.json');
  expect(tally.register('Bob', 'dat://....')).toBe(true);
  expect(tally.register('Bob', 'dat://....')).toBe(false);
  expect(tally.register('Alice', 'dat://....')).toBe(false);
  expect(tally.register('Alice', 'file://....')).toBe(true);
});

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
