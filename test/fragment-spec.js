var testHelper = require('../etc/test-helper.js');

describe('Document definition fragments:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-fragment-sync-function.js');
  });

  it('can create documents for a document type whose definition was imported with a single-quoted filename', function() {
    var doc = {
      _id: 'stringFragmentDoc',
      stringProp: '2017-01-06'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can create documents for a document type whose definition was imported with a double-quoted filename', function() {
    var doc = {
      _id: 'booleanFragmentDoc',
      booleanProp: true
    };

    testHelper.verifyDocumentCreated(doc);
  });
});
