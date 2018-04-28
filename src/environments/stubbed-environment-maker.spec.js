const { expect } = require('chai');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Stubbed environment maker', () => {
  let environmentMaker, fsMock, vmMock;

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    vmMock = { runInThisContext: simpleMock.stub() };
    mockRequire('vm', vmMock);

    environmentMaker = mockRequire.reRequire('./stubbed-environment-maker');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('creates a environment from the input with a filename for stack traces', () => {
    verifyParse('my-sync-func-\\`1\\`', 'my-sync-func-`1`', 'my-original-filename', true);
  });

  it('creates a environment from the input but without a filename', () => {
    verifyParse('my-sync-func-\\`2\\`', 'my-sync-func-\\`2\\`');
  });

  function verifyParse(originalContents, expectedContents, originalFilename, unescapeBackticks) {
    const templateFile = 'my-template-file-path';
    const macroName = '$my-template-macro$';

    const envTemplateFileContents = `template: ${macroName}`;
    fsMock.readFileSync.returnWith(envTemplateFileContents);

    const expectedEnvString = envTemplateFileContents.replace(macroName, () => expectedContents);

    const expectedResult = { bar: 'foo' };
    vmMock.runInThisContext.returnWith(expectedResult);

    const result =
      environmentMaker.create(templateFile, macroName, originalContents, originalFilename, unescapeBackticks);

    expect(result).to.eql(expectedResult);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ templateFile, 'utf8' ]);

    expect(vmMock.runInThisContext.callCount).to.equal(1);
    expect(vmMock.runInThisContext.calls[0].args).to.eql([
      `(${expectedEnvString});`,
      {
        filename: originalFilename,
        displayErrors: true
      }
    ]);
  }
});
