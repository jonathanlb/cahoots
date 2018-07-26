const DatProposer = require('../src/DatProposer');

test('splits uris', () => {
  const dp = new DatProposer();
  const uri = 'https://foo.bar/baz/bob.html';
  expect(dp.splitUri(uri)).toEqual(
    {
      volume: 'https://foo.bar',
      fileName: '/baz/bob.html'
    });
});

test('splits uris with redundant slashes', () => {
  const dp = new DatProposer();
  const uri = 'https://foo.bar///baz//bob.html';
  expect(dp.splitUri(uri)).toEqual(
    {
      volume: 'https://foo.bar',
      fileName: '/baz/bob.html'
    });
});
