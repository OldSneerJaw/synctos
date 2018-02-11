const path = require('path');
const expect = require('chai').expect;
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Sync function loader', function() {
  let syncFunctionLoader, fsMock, indentMock, fileFragmentLoaderMock, docDefinitionsLoaderMock;

  const expectedMacroName = 'importSyncFunctionFragment';
  const syncFuncTemplateDir = path.resolve(__dirname, '../../templates');
  const syncFuncTemplateFile = path.resolve(syncFuncTemplateDir, 'sync-function-template.js');

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    indentMock = { js: simpleMock.stub() };
    mockRequire('../../lib/indent.js/indent.min.js', indentMock);

    fileFragmentLoaderMock = { load: simpleMock.stub() };
    mockRequire('./file-fragment-loader.js', fileFragmentLoaderMock);

    docDefinitionsLoaderMock = { load: simpleMock.stub() };
    mockRequire('./document-definitions-loader.js', docDefinitionsLoaderMock);

    syncFunctionLoader = mockRequire.reRequire('./sync-function-loader');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should load a sync function', function() {
    const docDefinitionsFile = 'my/doc-definitions.js';
    const docDefinitionsContent = 'my-doc-definitions';
    const originalSyncFuncTemplate = 'my-original-sync-fync-template';
    const updatedSyncFuncTemplate = 'function my-sync-func-template() { %SYNC_DOCUMENT_DEFINITIONS%; }';
    const indentedSyncFunc = 'my\n  \r\nfinal\rsync `func`';

    fsMock.readFileSync.returnWith(originalSyncFuncTemplate);
    fileFragmentLoaderMock.load.returnWith(updatedSyncFuncTemplate);
    docDefinitionsLoaderMock.load.returnWith(docDefinitionsContent);
    indentMock.js.returnWith(indentedSyncFunc);

    const result = syncFunctionLoader.load(docDefinitionsFile);

    expect(result).to.equal('my\n\nfinal\nsync \\`func\\`');

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ syncFuncTemplateFile, 'utf8' ]);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(1);
    expect(fileFragmentLoaderMock.load.calls[0].args).to.eql([ syncFuncTemplateDir, expectedMacroName, originalSyncFuncTemplate ]);

    expect(docDefinitionsLoaderMock.load.callCount).to.equal(1);
    expect(docDefinitionsLoaderMock.load.calls[0].args).to.eql([ docDefinitionsFile ]);

    expect(indentMock.js.callCount).to.equal(1);
    expect(indentMock.js.calls[0].args).to.eql(
      [ 'function my-sync-func-template() { ' + docDefinitionsContent + '; }', { tabString: '  ' } ]);
  });

  it('should throw an exception if the sync function template file does not exist', function() {
    const docDefinitionsFile = 'my/doc-definitions.js';
    const expectedException = new Error('my-expected-exception');

    fsMock.readFileSync.throwWith(expectedException);
    fileFragmentLoaderMock.load.returnWith('');
    docDefinitionsLoaderMock.load.returnWith('');
    indentMock.js.returnWith('');

    expect(function() {
      syncFunctionLoader.load(docDefinitionsFile);
    }).to.throw(expectedException.message);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ syncFuncTemplateFile, 'utf8' ]);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(0);

    expect(docDefinitionsLoaderMock.load.callCount).to.equal(0);

    expect(indentMock.js.callCount).to.equal(0);
  });
});
