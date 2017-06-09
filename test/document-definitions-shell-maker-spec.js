var expect = require('expect.js');
var simpleMock = require('simple-mock');
var mockRequire = require('mock-require');

describe('Document definitions shell maker', function() {
  var docDefinitionsShellMaker, vmMock;

  beforeEach(function() {
    vmMock = { runInNewContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    docDefinitionsShellMaker = mockRequire.reRequire('../src/document-definitions-shell-maker.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  function verifyParse(docDefinitionsString, originalFilename) {
    var expectedOutput = { foo: 'bar' };
    vmMock.runInNewContext.returnWith(expectedOutput);

    var result = docDefinitionsShellMaker.createShell(docDefinitionsString, originalFilename);

    expect(result).to.eql(expectedOutput);

    expect(vmMock.runInNewContext.callCount).to.be(1);
    expect(vmMock.runInNewContext.calls[0].args[0]).to.equal('(' + docDefinitionsString + ');');
    expect(vmMock.runInNewContext.calls[0].args[2]).to.eql({
      filename: originalFilename,
      displayErrors: true
    });

    var sandbox = vmMock.runInNewContext.calls[0].args[1];
    expect(sandbox).to.only.have.keys([
      'doc',
      'oldDoc',
      'typeIdValidator',
      'simpleTypeFilter',
      'isDocumentMissingOrDeleted',
      'isValueNullOrUndefined',
      'getEffectiveOldDoc',
      'requireAccess',
      'requireRole',
      'requireUser',
      'channel',
      'access',
      'role'
    ]);
    expect(sandbox.doc).to.be.an('object');
    expect(sandbox.doc).not.to.be.an(Array);
    expect(sandbox.oldDoc).to.be.an('object');
    expect(sandbox.oldDoc).not.to.be.an(Array);
    expect(sandbox.typeIdValidator).to.be.an('object');
    expect(sandbox.typeIdValidator).not.to.be.an(Array);
    expect(sandbox.simpleTypeFilter).to.be.a('function');
    expect(sandbox.isDocumentMissingOrDeleted).to.be.a('function');
    expect(sandbox.isValueNullOrUndefined).to.be.a('function');
    expect(sandbox.getEffectiveOldDoc).to.be.a('function');
    expect(sandbox.requireAccess).to.be.a('function');
    expect(sandbox.requireRole).to.be.a('function');
    expect(sandbox.requireUser).to.be.a('function');
    expect(sandbox.channel).to.be.a('function');
    expect(sandbox.access).to.be.a('function');
    expect(sandbox.role).to.be.a('function');
  }

  it('creates a shell from the input with a filename for stack traces', function() {
    verifyParse('my-doc-definitions1', 'my-original-filename');
  });

  it('creates a shell from the input but without a filename', function() {
    verifyParse('my-doc-definitions2');
  });
});
