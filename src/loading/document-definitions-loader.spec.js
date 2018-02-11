const expect = require('chai').expect;
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Document definitions loader', () => {
  let docDefinitionsLoader, fsMock, pathMock, vmMock, fileFragmentLoaderMock;

  const expectedMacroName = 'importDocumentDefinitionFragment';

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    pathMock = { dirname: simpleMock.stub() };
    mockRequire('path', pathMock);

    vmMock = { runInNewContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    fileFragmentLoaderMock = { load: simpleMock.stub() };
    mockRequire('./file-fragment-loader.js', fileFragmentLoaderMock);

    docDefinitionsLoader = mockRequire.reRequire('./document-definitions-loader');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should load the contents of a document definitions file that exists', () => {
    const docDefinitionsFile = 'my/doc-definitions.js';
    const expectedDir = '/an/arbitrary/directory';
    const originalFileContents = '\tmy-original-doc-definitions\n';
    const expectedFileContents = 'my-expected-doc-definitions';

    fsMock.readFileSync.returnWith(originalFileContents);
    pathMock.dirname.returnWith(expectedDir);
    fileFragmentLoaderMock.load.returnWith(expectedFileContents);

    const result = docDefinitionsLoader.load(docDefinitionsFile);

    expect(result).to.equal(expectedFileContents);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ docDefinitionsFile, 'utf8' ]);

    expect(pathMock.dirname.callCount).to.equal(1);
    expect(pathMock.dirname.calls[0].args).to.eql([ docDefinitionsFile ]);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(1);
    expect(fileFragmentLoaderMock.load.calls[0].args).to.eql([ expectedDir, expectedMacroName, originalFileContents.trim() ]);
  });

  it('should throw an exception if the document definitions file does not exist', () => {
    const docDefinitionsFile = 'my/doc-definitions.js';
    const expectedException = new Error('my-expected-exception');

    fsMock.readFileSync.throwWith(expectedException);
    pathMock.dirname.returnWith('');
    fileFragmentLoaderMock.load.returnWith('');

    expect(() => {
      docDefinitionsLoader.load(docDefinitionsFile);
    }).to.throw(expectedException.message);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ docDefinitionsFile, 'utf8' ]);

    expect(pathMock.dirname.callCount).to.equal(0);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(0);
  });
});
