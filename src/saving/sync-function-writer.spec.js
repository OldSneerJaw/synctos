const { expect } = require('chai');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Sync function loader', () => {
  let syncFunctionWriter, fsMock, mkdirpMock;

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    fsMock = { existsSync: simpleMock.stub(), writeFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    mkdirpMock = { sync: simpleMock.stub() };
    mockRequire('../../lib/mkdirp/index', mkdirpMock);

    syncFunctionWriter = mockRequire.reRequire('./sync-function-writer');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should create an output directory that does not exist and save the sync function to the correct file', () => {
    const outputDirectory = '/foo/bar/baz';
    const filePath = `${outputDirectory}/qux.js`;
    const syncFuncString = '"my" `sync` \\function\\:\r\ndo\rsomething\nhere';

    // The output dir does not exist
    fsMock.existsSync.returnWith(false);

    syncFunctionWriter.save(filePath, syncFuncString);

    expect(fsMock.existsSync.callCount).to.equal(1);
    expect(fsMock.existsSync.calls[0].args).to.deep.equal([ outputDirectory ]);

    expect(mkdirpMock.sync.callCount).to.equal(1);
    expect(mkdirpMock.sync.calls[0].args).to.deep.equal([ outputDirectory ]);

    expect(fsMock.writeFileSync.callCount).to.equal(1);
    expect(fsMock.writeFileSync.calls[0].args)
      .to.deep.equal([ filePath, '"my" \\`sync\\` \\function\\:\ndo\nsomething\nhere', 'utf8' ]);
  });

  it('should save the sync function to the correct file enclosed in a JSON-compatible string', () => {
    const outputDirectory = '/foo/bar/baz';
    const filePath = `${outputDirectory}/qux.js`;
    const syncFuncString = '"my" `sync` \\function\\:\r\ndo\rsomething\nhere';

    // The output dir does exist
    fsMock.existsSync.returnWith(true);

    syncFunctionWriter.save(filePath, syncFuncString, { jsonString: true });

    expect(fsMock.existsSync.callCount).to.equal(1);
    expect(fsMock.existsSync.calls[0].args).to.deep.equal([ outputDirectory ]);

    expect(mkdirpMock.sync.callCount).to.equal(0);

    expect(fsMock.writeFileSync.callCount).to.equal(1);
    expect(fsMock.writeFileSync.calls[0].args)
      .to.deep.equal([ filePath, '"\\"my\\" \\\\`sync\\\\` \\\\function\\\\:\\ndo\\nsomething\\nhere"', 'utf8' ]);
  });
});
