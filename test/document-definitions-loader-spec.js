var expect = require('expect.js');
var simpleMock = require('simple-mock');
var mockRequire = require('mock-require');

describe('Document definitions loader', function() {
  var docDefinitionsLoader, fsMock, pathMock, vmMock, fileFragmentLoaderMock;

  var expectedMacroName = 'importDocumentDefinitionFragment';

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    pathMock = { dirname: simpleMock.stub() };
    mockRequire('path', pathMock);

    vmMock = { runInNewContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    fileFragmentLoaderMock = { load: simpleMock.stub() };
    mockRequire('../etc/file-fragment-loader.js', fileFragmentLoaderMock);

    docDefinitionsLoader = mockRequire.reRequire('../etc/document-definitions-loader.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  describe('when loading from a file', function() {
    it('should load the contents of a document definitions file that exists', function() {
      var docDefinitionsFile = 'my/doc-definitions.js';
      var expectedDir = '/an/arbitrary/directory';
      var originalFileContents = '\tmy-original-doc-definitions\n';
      var expectedFileContents = 'my-expected-doc-definitions';

      fsMock.readFileSync.returnWith(originalFileContents);
      pathMock.dirname.returnWith(expectedDir);
      fileFragmentLoaderMock.load.returnWith(expectedFileContents);

      var result = docDefinitionsLoader.load(docDefinitionsFile);

      expect(result).to.equal(expectedFileContents);

      expect(fsMock.readFileSync.callCount).to.be(1);
      expect(fsMock.readFileSync.calls[0].args).to.eql([ docDefinitionsFile, 'utf8' ]);

      expect(pathMock.dirname.callCount).to.be(1);
      expect(pathMock.dirname.calls[0].args).to.eql([ docDefinitionsFile ]);

      expect(fileFragmentLoaderMock.load.callCount).to.be(1);
      expect(fileFragmentLoaderMock.load.calls[0].args).to.eql([ expectedDir, expectedMacroName, originalFileContents.trim() ]);
    });

    it('should throw an exception if the document definitions file does not exist', function() {
      var docDefinitionsFile = 'my/doc-definitions.js';
      var expectedException = new Error('my-expected-exception');

      fsMock.readFileSync.throwWith(expectedException);
      pathMock.dirname.returnWith('');
      fileFragmentLoaderMock.load.returnWith('');

      expect(docDefinitionsLoader.load).withArgs(docDefinitionsFile).to.throwException(expectedException.message);

      expect(fsMock.readFileSync.callCount).to.be(1);
      expect(fsMock.readFileSync.calls[0].args).to.eql([ docDefinitionsFile, 'utf8' ]);

      expect(pathMock.dirname.callCount).to.be(0);

      expect(fileFragmentLoaderMock.load.callCount).to.be(0);
    });
  });

  describe('when parsing a document definitions string as JavaScript', function() {
    function verifyParse(docDefinitionsString, originalFilename) {
      var expectedOutput = { foo: 'bar' };
      vmMock.runInNewContext.returnWith(expectedOutput);

      var result = docDefinitionsLoader.parseDocDefinitions(docDefinitionsString, originalFilename);

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

    it('evaluates the input with a filename for stack traces', function() {
      verifyParse('my-doc-definitions1', 'my-original-filename');
    });

    it('evaluates the input without a filename', function() {
      verifyParse('my-doc-definitions2');
    });
  });
});
