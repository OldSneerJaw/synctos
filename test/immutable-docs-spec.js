var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Immutable document validation parameter', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-immutable-docs-sync-function.js');
  });

  it('can create a document if the old document does not exist', function() {
    var doc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can create a document if the old document was deleted', function() {
    var doc = {
      _id: 'immutableDoc',
      stringProp: 'barfoo'
    };
    var oldDoc = { _id: 'immutableDoc', _deleted: true };

    testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
  });

  it('can delete a document if the old document was already deleted', function() {
    // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
    // that it works properly
    var oldDoc = { _id: 'immutableDoc', _deleted: true };

    testHelper.verifyDocumentDeleted(oldDoc);
  });

  it('can delete a document if the old document does not exist', function() {
    // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
    // that it works properly
    var doc = {
      _id: 'immutableDoc',
      _deleted: true
    };

    testHelper.verifyDocumentAccepted(doc, undefined, 'write');
  });

  it('cannot replace an existing document even if its properties have not been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };

    testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableDoc', errorFormatter.immutableDocViolation());
  });

  it('cannot delete an existing document', function() {
    var oldDoc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };

    testHelper.verifyDocumentNotDeleted(oldDoc, 'immutableDoc', errorFormatter.immutableDocViolation());
  });

  it('cannot modify attachments after the document has been created', function() {
    var doc = {
      _id: 'immutableDoc',
      _attachments: {
        'bar.pdf': {
          'content_type': 'application/pdf'
        }
      },
      stringProp: 'foobar'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      _attachments: {
        'foo.pdf': {
          'content_type': 'application/pdf'
        }
      },
      stringProp: 'foobar'
    };

    testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableDoc', errorFormatter.immutableDocViolation());
  });
});
