const { expect } = require('chai');
const mockRequire = require('mock-require');
const path = require('path');
const simpleMock = require('../../lib/simple-mock/index');
const underscore = require('../../lib/underscore/underscore-min');

describe('Validation environment maker', () => {
  let validationEnvironmentMaker, stubbedEnvironmentMakerMock;

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    stubbedEnvironmentMakerMock = { create: simpleMock.stub() };
    mockRequire('../environments/stubbed-environment-maker', stubbedEnvironmentMakerMock);

    validationEnvironmentMaker = mockRequire.reRequire('./validation-environment-maker');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('creates a stubbed environment for schema validation', () => {
    const documentDefinitionsString = 'my-doc-definitions-1';

    const expectedResult = { foo: 'baz' };
    const mockEnvironment = simpleMock.stub();
    mockEnvironment.returnWith(expectedResult);

    stubbedEnvironmentMakerMock.create.returnWith(mockEnvironment);

    const result = validationEnvironmentMaker.create(documentDefinitionsString);

    expect(result).to.eql(expectedResult);

    expect(stubbedEnvironmentMakerMock.create.callCount).to.equal(1);
    expect(stubbedEnvironmentMakerMock.create.calls[0].args).to.eql([
      path.resolve(__dirname, '../../templates/environments/validation-environment-template.js'),
      '$DOC_DEFINITIONS_PLACEHOLDER$',
      documentDefinitionsString
    ]);

    expect(mockEnvironment.callCount).to.equal(1);
    expect(mockEnvironment.calls[0].args).to.eql([ underscore, simpleMock ]);
  });
});
