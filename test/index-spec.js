var expect = require('chai').expect;
var index = require('../src/index');

describe('Main package module', function() {
  it('exposes the public API', function() {
    expect(index.syncFunctionLoader).to.equal(require('../src/sync-function-loader'));
    expect(index.testHelper).to.equal(require('../src/test-helper'));
    expect(index.validationErrorFormatter).to.equal(require('../src/validation-error-formatter'));
  });
});
