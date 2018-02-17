var expect = require('chai').expect;
var path = require('path');
var simpleMock = require('../../lib/simple-mock/index');
var mockRequire = require('mock-require');

describe('Validation environment maker', function() {
  var environmentMaker, fsMock, vmMock;

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    vmMock = { runInThisContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    environmentMaker = mockRequire.reRequire('./validation-environment-maker');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  function verifyParse(rawDocumentDefinitions, originalFilename) {
    var envTemplateFileContents = 'template: %DOC_DEFINITIONS_PLACEHOLDER%';
    fsMock.readFileSync.returnWith(envTemplateFileContents);

    var expectedEnvString = envTemplateFileContents.replace(
      '%DOC_DEFINITIONS_PLACEHOLDER%',
      function() { return rawDocumentDefinitions; });

    var expectedResult = { foo: 'bar' };
    var mockVmEnvironment = simpleMock.stub();
    mockVmEnvironment.returnWith(expectedResult);

    vmMock.runInThisContext.returnWith(mockVmEnvironment);

    var result = environmentMaker.init(rawDocumentDefinitions, originalFilename);

    expect(result).to.eql(expectedResult);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([
      path.resolve(__dirname, '../../templates/validation-environment-template.js'),
      'utf8'
    ]);

    expect(vmMock.runInThisContext.callCount).to.equal(1);
    expect(vmMock.runInThisContext.calls[0].args).to.eql([
      '(' + expectedEnvString + ');',
      {
        filename: originalFilename,
        displayErrors: true
      }
    ]);

    expect(mockVmEnvironment.callCount).to.equal(1);
  }

  it('creates an environment from the input with a filename for stack traces', function() {
    verifyParse('my-doc-definitions-1', 'my-original-filename');
  });

  it('creates an environment from the input but without a filename', function() {
    verifyParse('my-doc-definitions-2');
  });
});
