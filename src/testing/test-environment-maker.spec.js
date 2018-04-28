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

  it('creates a stubbed environment for tests with backticks unescaped', () => {
    verify(true);
  });

  it('creates a stubbed environment for tests with backticks left unescaped', () => {
    verify(false);
  });

  function verify(unescapeBackticks) {
    const syncFunctionString = 'my-sync-func';
    const syncFunctionFile = 'my-original-filename';

    const expectedResult = { foo: 'baz' };
    const mockEnvironment = simpleMock.stub();
    mockEnvironment.returnWith(expectedResult);

    stubbedEnvironmentMakerMock.create.returnWith(mockEnvironment);

    const result = testEnvironmentMaker.create(syncFunctionString, syncFunctionFile, unescapeBackticks);

    expect(result).to.eql(expectedResult);

    expect(stubbedEnvironmentMakerMock.create.callCount).to.equal(1);
    expect(stubbedEnvironmentMakerMock.create.calls[0].args).to.eql([
      path.resolve(__dirname, '../../templates/environments/test-environment-template.js'),
      '$SYNC_FUNC_PLACEHOLDER$',
      syncFunctionString,
      path.resolve(process.cwd(), syncFunctionFile),
      unescapeBackticks
    ]);

    expect(mockEnvironment.callCount).to.equal(1);
    expect(mockEnvironment.calls[0].args).to.eql([ underscore, simpleMock ]);
  }
});
