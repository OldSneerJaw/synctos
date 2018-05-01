const { expect } = require('chai');
const mockRequire = require('mock-require');
const path = require('path');
const simpleMock = require('../../lib/simple-mock/index');
const underscore = require('../../lib/underscore/underscore-min');

describe('Test environment maker', () => {
  let testEnvironmentMaker, stubbedEnvironmentMakerMock;

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    stubbedEnvironmentMakerMock = { create: simpleMock.stub() };
    mockRequire('../environments/stubbed-environment-maker', stubbedEnvironmentMakerMock);

    testEnvironmentMaker = mockRequire.reRequire('./test-environment-maker');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('creates a stubbed environment for tests with backtick escape sequences unescaped', () => {
    verify('my-\\`sync\\`-func-\\`1\\`', 'my-`sync`-func-`1`', 'my-filename', true);
  });

  it('creates a stubbed environment for tests with backtick escape sequences left unmodified', () => {
    verify('my-sync-func-\\`2\\`', 'my-sync-func-\\`2\\`');
  });

  function verify(originalSyncFuncString, expectedSyncFuncString, syncFunctionFile, unescapeBackticks) {
    const expectedResult = { foo: 'baz' };
    const mockEnvironment = simpleMock.stub();
    mockEnvironment.returnWith(expectedResult);

    stubbedEnvironmentMakerMock.create.returnWith(mockEnvironment);

    const result = testEnvironmentMaker.create(originalSyncFuncString, syncFunctionFile, unescapeBackticks);

    expect(result).to.eql(expectedResult);

    expect(stubbedEnvironmentMakerMock.create.callCount).to.equal(1);
    expect(stubbedEnvironmentMakerMock.create.calls[0].args).to.eql([
      path.resolve(__dirname, '../../templates/environments/test-environment-template.js'),
      '$SYNC_FUNC_PLACEHOLDER$',
      expectedSyncFuncString,
      syncFunctionFile ? path.resolve(process.cwd(), syncFunctionFile) : syncFunctionFile
    ]);

    expect(mockEnvironment.callCount).to.equal(1);
    expect(mockEnvironment.calls[0].args).to.eql([ underscore, simpleMock ]);
  }
});
