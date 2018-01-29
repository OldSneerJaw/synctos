var expect = require('chai').expect;
var simpleMock = require('../lib/simple-mock/index.js');
var mockRequire = require('mock-require');

describe('File fragment loader', function() {
  var fileFragmentLoader, fsMock;

  beforeEach(function() {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);
    fileFragmentLoader = mockRequire.reRequire('./file-fragment-loader.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should replace instances of the macro with the correct file contents', function() {
    var baseDir = '/my/base/dir';
    var macroName = 'myFileFragmentMacro';
    var rawText = 'doSomething();\nnotmyFileFragmentMacro("foo.js");myFileFragmentMacro("bar.js");\tmyFileFragmentMacro(\'foo\\ baz.js\');';

    var fileFragment1Contents = ' somethingElseGoesHere()\n';
    var fileFragment2Contents = '\nyetAnotherThingHere(\'qux\') ';
    fsMock.readFileSync.withActions([
        { returnValue: fileFragment1Contents }, // First call successfully reads bar.js with a relative path
        { throwError: new Error('') }, // Second call attempts and fails to read baz.js with a relative path
        { returnValue: fileFragment2Contents } // Third call retries baz.js with an absolute path and succeeds
      ]);

    var result = fileFragmentLoader.load(baseDir, macroName, rawText);

    expect(result).to.equal('doSomething();\nnotmyFileFragmentMacro("foo.js");' + fileFragment1Contents.trim() + ';\t' + fileFragment2Contents.trim() + ';');

    expect(fsMock.readFileSync.callCount).to.equal(3);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ baseDir + '/bar.js', 'utf8' ]);
    expect(fsMock.readFileSync.calls[1].args).to.eql([ baseDir + '/foo baz.js', 'utf8' ]);
    expect(fsMock.readFileSync.calls[2].args).to.eql([ 'foo baz.js', 'utf8' ]);
  });

  it('should throw an exception if the file fragment cannot be found', function() {
    var baseDir = '/my/base/dir';
    var macroName = 'myFileFragmentMacro';
    var rawText = 'doSomething();\nmyFileFragmentMacro("foo.js");';

    var expectedException = new Error('my-expected-exception');
    fsMock.readFileSync.throwWith(expectedException);

    expect(function() {
      fileFragmentLoader.load(baseDir, macroName, rawText);
    }).to.throw(expectedException.message);

    expect(fsMock.readFileSync.callCount).to.equal(2);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ baseDir + '/foo.js', 'utf8' ]);
    expect(fsMock.readFileSync.calls[1].args).to.eql([ 'foo.js', 'utf8' ]);
  });
});
