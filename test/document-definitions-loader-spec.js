var expect = require('chai').expect;
var simpleMock = require('../lib/simple-mock/index.js');
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
    mockRequire('../src/file-fragment-loader.js', fileFragmentLoaderMock);

    docDefinitionsLoader = mockRequire.reRequire('../src/document-definitions-loader.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

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

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ docDefinitionsFile, 'utf8' ]);

    expect(pathMock.dirname.callCount).to.equal(1);
    expect(pathMock.dirname.calls[0].args).to.eql([ docDefinitionsFile ]);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(1);
    expect(fileFragmentLoaderMock.load.calls[0].args).to.eql([ expectedDir, expectedMacroName, originalFileContents.trim() ]);
  });

  it('should throw an exception if the document definitions file does not exist', function() {
    var docDefinitionsFile = 'my/doc-definitions.js';
    var expectedException = new Error('my-expected-exception');

    fsMock.readFileSync.throwWith(expectedException);
    pathMock.dirname.returnWith('');
    fileFragmentLoaderMock.load.returnWith('');

    expect(function() {
      docDefinitionsLoader.load(docDefinitionsFile);
    }).to.throw(expectedException.message);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ docDefinitionsFile, 'utf8' ]);

    expect(pathMock.dirname.callCount).to.equal(0);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(0);
  });
});
