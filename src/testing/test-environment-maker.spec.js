const { expect } = require('chai');
const path = require('path');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Test environment maker', () => {
  let testEnvironmentMaker, fsMock, vmMock;

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    vmMock = { runInThisContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    testEnvironmentMaker = mockRequire.reRequire('./test-environment-maker');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('creates a test environment from the input with a filename for stack traces', () => {
    verifyParse('my-sync-func-\\`1\\`', 'my-original-filename', true);
  });

  it('creates a test environment from the input but without a filename', () => {
    verifyParse('my-sync-func-\\`2\\`', null, false);
  });

  function verifyParse(rawSyncFunction, originalFilename, unescapeBackticks) {
    const envTemplateFileContents = 'template: $SYNC_FUNC_PLACEHOLDER$';
    fsMock.readFileSync.returnWith(envTemplateFileContents);

    const expectedTestEnvString = envTemplateFileContents.replace(
      '$SYNC_FUNC_PLACEHOLDER$',
      () => unescapeBackticks ? rawSyncFunction.replace(/\\`/g, () => '`') : rawSyncFunction);

    const expectedResult = { bar: 'foo' };
    const mockVmEnvironment = simpleMock.stub();
    mockVmEnvironment.returnWith(expectedResult);

    vmMock.runInThisContext.returnWith(mockVmEnvironment);

    const result = testEnvironmentMaker.init(rawSyncFunction, originalFilename, unescapeBackticks);

    expect(result).to.eql(expectedResult);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([
      path.resolve(__dirname, '../../templates/environments/test-environment-template.js'),
      'utf8'
    ]);

    expect(vmMock.runInThisContext.callCount).to.equal(1);
    expect(vmMock.runInThisContext.calls[0].args).to.eql([
      `(${expectedTestEnvString});`,
      {
        filename: originalFilename ? path.resolve(process.cwd(), originalFilename) : originalFilename,
        displayErrors: true
      }
    ]);

    expect(mockVmEnvironment.callCount).to.equal(1);
  }
});
