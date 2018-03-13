const { expect } = require('chai');
const index = require('./index');

describe('Main package module', () => {
  it('exposes the public API', () => {
    expect(index).to.eql({
      documentDefinitionsValidator: require('./validation/document-definitions-validator'),
      syncFunctionLoader: require('./loading/sync-function-loader'),
      testFixtureMaker: require('./testing/test-fixture-maker'),
      testHelper: require('./testing/test-helper'),
      validationErrorFormatter: require('./testing/validation-error-formatter')
    });
  });
});
