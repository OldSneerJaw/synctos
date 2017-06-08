var path = require('path');
var expect = require('expect.js');
var simpleMock = require('simple-mock');
var mockRequire = require('mock-require');

describe('Sync function loader', function() {
  var syncFunctionLoader, fsMock, indentMock, fileFragmentLoaderMock, docDefinitionsLoaderMock;

  var expectedMacroName = 'importSyncFunctionFragment';
  var syncFuncTemplateDir = path.resolve(__dirname, '../etc');

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    indentMock = { indentJS: simpleMock.stub() };
    mockRequire('../lib/indent.js/indent.min.js', indentMock);

    fileFragmentLoaderMock = { load: simpleMock.stub() };
    mockRequire('../etc/file-fragment-loader.js', fileFragmentLoaderMock);

    docDefinitionsLoaderMock = { load: simpleMock.stub() };
    mockRequire('../etc/document-definitions-loader.js', docDefinitionsLoaderMock);

    syncFunctionLoader = mockRequire.reRequire('../etc/sync-function-loader.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should load a sync function', function() {
    var docDefinitionsFile = 'my/doc-definitions.js';
    var docDefinitionsContent = 'my-doc-definitions';
    var originalSyncFuncTemplate = 'my-original-sync-fync-template';
    var updatedSyncFuncTemplate = 'function my-sync-func-template() { %SYNC_DOCUMENT_DEFINITIONS%; }';
    var indentedSyncFunc = 'my\n  \r\nfinal\rsync `func`';

    fsMock.readFileSync.returnWith(originalSyncFuncTemplate);
    fileFragmentLoaderMock.load.returnWith(updatedSyncFuncTemplate);
    docDefinitionsLoaderMock.load.returnWith(docDefinitionsContent);
    indentMock.indentJS.returnWith(indentedSyncFunc);

    var result = syncFunctionLoader.load(docDefinitionsFile);

    expect(result).to.equal('my\n\nfinal\nsync \\`func\\`');

    expect(fsMock.readFileSync.callCount).to.be(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ path.resolve(syncFuncTemplateDir, 'sync-function-template.js'), 'utf8' ]);

    expect(fileFragmentLoaderMock.load.callCount).to.be(1);
    expect(fileFragmentLoaderMock.load.calls[0].args).to.eql([ syncFuncTemplateDir, expectedMacroName, originalSyncFuncTemplate ]);

    expect(docDefinitionsLoaderMock.load.callCount).to.be(1);
    expect(docDefinitionsLoaderMock.load.calls[0].args).to.eql([ docDefinitionsFile ]);

    expect(indentMock.indentJS.callCount).to.be(1);
    expect(indentMock.indentJS.calls[0].args).to.eql([ 'function my-sync-func-template() { ' + docDefinitionsContent + '; }', '  ' ]);
  });

  it('should throw an exception if the sync function template file does not exist', function() {
    var docDefinitionsFile = 'my/doc-definitions.js';
    var expectedException = new Error('my-expected-exception');

    fsMock.readFileSync.throwWith(expectedException);
    fileFragmentLoaderMock.load.returnWith('');
    docDefinitionsLoaderMock.load.returnWith('');
    indentMock.indentJS.returnWith('');

    expect(syncFunctionLoader.load).withArgs(docDefinitionsFile).to.throwException(expectedException.message);

    expect(fsMock.readFileSync.callCount).to.be(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ path.resolve(syncFuncTemplateDir, 'sync-function-template.js'), 'utf8' ]);

    expect(fileFragmentLoaderMock.load.callCount).to.be(0);

    expect(docDefinitionsLoaderMock.load.callCount).to.be(0);

    expect(indentMock.indentJS.callCount).to.be(0);
  });
});
