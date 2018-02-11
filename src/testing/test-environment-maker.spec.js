const expect = require('chai').expect;
const simpleMock = require('../../lib/simple-mock/index.js');
const mockRequire = require('mock-require');

describe('Test environment maker', function() {
  let testEnvironmentMaker, fsMock, vmMock;

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    vmMock = { runInThisContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    testEnvironmentMaker = mockRequire.reRequire('./test-environment-maker.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('creates a test environment from the input with a filename for stack traces', function() {
    verifyParse('my-sync-func-`1`', 'my-original-filename');
  });

  it('creates a test environment from the input but without a filename', function() {
    verifyParse('my-sync-func-\\`2\\`');
  });

  function verifyParse(rawSyncFunction, originalFilename) {
    const envTemplateFileContents = 'template: %SYNC_FUNC_PLACEHOLDER%';
    fsMock.readFileSync.returnWith(envTemplateFileContents);

    const expectedTestEnvString = envTemplateFileContents.replace(
      '%SYNC_FUNC_PLACEHOLDER%',
      function() { return rawSyncFunction.replace(/\\`/g, function() { return '`'; }); });

    const expectedResult = { bar: 'foo' };
    const mockVmEnvironment = simpleMock.stub();
    mockVmEnvironment.returnWith(expectedResult);

    vmMock.runInThisContext.returnWith(mockVmEnvironment);

    const result = testEnvironmentMaker.init(rawSyncFunction, originalFilename);

    expect(result).to.eql(expectedResult);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ 'templates/test-environment-template.js', 'utf8' ]);

    expect(vmMock.runInThisContext.callCount).to.equal(1);
    expect(vmMock.runInThisContext.calls[0].args).to.eql([
      '(' + expectedTestEnvString + ');',
      {
        filename: originalFilename,
        displayErrors: true
      }
    ]);

    expect(mockVmEnvironment.callCount).to.equal(1);
  }
});
