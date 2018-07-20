const interfaceMethods = [
  'propose', 'readBallot', 'stop', 'watchProposal'
];

const dat = new (require('../src/DatProposer'))();
interfaceMethods.forEach(m => {
  test(`DatProposer has ${m} method implementation`, () => {
    expect(dat[m]).toBeDefined();
  });
});

const file = new (require('../src/FileProposer'))();
interfaceMethods.forEach(m => {
  test(`FileProposer has ${m} method implementation`, () => {
    expect(file[m]).toBeDefined();
  });
});

const http = new (require('../src/HttpProposer'))();
interfaceMethods.forEach(m => {
  test(`HttpProposer has ${m} method implementation`, () => {
    expect(http[m]).toBeDefined();
  });
});
