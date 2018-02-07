var expect = require('chai').expect;
var index = require('./index');

describe('Main package module', function() {
  it('exposes the public API', function() {
    expect(index.documentDefinitionsValidator).to.equal(require('./validation/document-definitions-validator'));
    expect(index.syncFunctionLoader).to.equal(require('./sync-function-loader'));
    expect(index.testHelper).to.equal(require('./test-helper'));
    expect(index.validationErrorFormatter).to.equal(require('./validation-error-formatter'));
  });
});
