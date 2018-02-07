var expect = require('chai').expect;
var index = require('./index');

describe('Main package module', function() {
  it('exposes the public API', function() {
    expect(index).to.eql({
      documentDefinitionsValidator: require('./validation/document-definitions-validator'),
      syncFunctionLoader: require('./loading/sync-function-loader'),
      testHelper: require('./testing/test-helper'),
      validationErrorFormatter: require('./testing/validation-error-formatter')
    });
  });
});
