const BallotSearch = require('../src/BallotSearch');

test('can find last chat time', () => {
  const ballot = {
    createdMillis: 10000,
    chat: [[20000, "foo"], [30000, "bar"]]
  };
  expect(new Date(BallotSearch.lastActive(ballot)).getTime()).
    toEqual(30000);
});

test('can substitute issue create time for empty chat', () => {
  const ballot = {
    createdMillis: 10000
  };
  expect(new Date(BallotSearch.lastActive(ballot)).getTime()).
    toEqual(10000);
});

test('formats links', () => {
  const search = new BallotSearch();
  const ballot = {
    issueName: 'Lunch Plans'
  };
  const ballotUri = 'dat://1234/ballots';
  expect(search.link(ballotUri, ballot)).
    toEqual('about:blank/?config=dat://1234/ballots/lunch_plans.json');
});

test('uses default timestamp in absence of timestamp', () => {
  const ballot = { };
  expect(BallotSearch.lastActive(ballot)).toEqual('???');
});
