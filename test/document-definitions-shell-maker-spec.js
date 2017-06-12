var path = require('path');
var expect = require('expect.js');
var simpleMock = require('simple-mock');
var mockRequire = require('mock-require');

describe('Document definitions shell maker', function() {
  var environmentShellMaker, fsMock, vmMock;

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    vmMock = { runInThisContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    environmentShellMaker = mockRequire.reRequire('../src/document-definitions-shell-maker.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  function verifyParse(expectedFileContents, originalFilename) {
    fsMock.readFileSync.returnWith(expectedFileContents);

    var expectedResult = { foo: 'bar' };
    var mockEnvironment = simpleMock.stub();
    mockEnvironment.returnWith(expectedResult);

    vmMock.runInThisContext.returnWith(mockEnvironment);

    var result = environmentShellMaker.createShell(expectedFileContents, originalFilename);

    expect(result).to.eql(expectedResult);

    expect(fsMock.readFileSync.callCount).to.be(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ path.resolve(__dirname, '../src/templates/document-definitions-shell-template.js'), 'utf8' ]);

    expect(vmMock.runInThisContext.callCount).to.be(1);
    expect(vmMock.runInThisContext.calls[0].args).to.eql([
      '(' + expectedFileContents + ');',
      {
        filename: originalFilename,
        displayErrors: true
      }
    ]);

    expect(mockEnvironment.callCount).to.be(1);
  }

  it('creates a shell from the input with a filename for stack traces', function() {
    verifyParse('my-doc-definitions1', 'my-original-filename');
  });

  it('creates a shell from the input but without a filename', function() {
    verifyParse('my-doc-definitions2');
  });
});
