var testHelper = require('../src/test-helper.js');

describe('Array validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-underscore-js-sync-function.js');
  });

  it('allows a document that satisfies a custom validation constraint implemented with Underscore.js', function() {
    var doc = {
      _id: 'my-doc',
      type: 'underscoreDoc',
      myProp: 'foo.bar'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('rejects a document that fails a custom validation constraint implemented with Underscore.js', function() {
    var doc = {
      _id: 'my-doc',
      type: 'underscoreDoc',
      myProp: 'foo & bar'
    };

    testHelper.verifyDocumentNotCreated(doc, 'underscoreDoc', 'escaped value of "myProp" does not match raw value');
  });
});
