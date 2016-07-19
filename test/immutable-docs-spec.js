var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Immutable document validation:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-immutable-docs-sync-function.js');
  });

  describe('full document immutability constraint', function() {
    it('allows a document to be created if the old document does not exist', function() {
      var doc = {
        _id: 'immutableDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a document to be created if the old document was deleted', function() {
      var doc = {
        _id: 'immutableDoc',
        stringProp: 'barfoo'
      };
      var oldDoc = { _id: 'immutableDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('allows a document to be deleted if the old document was already deleted', function() {
      // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
      // that it works properly
      var oldDoc = { _id: 'immutableDoc', _deleted: true };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('allows a document to be deleted if the old document does not exist', function() {
      // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
      // that it works properly
      var doc = {
        _id: 'immutableDoc',
        _deleted: true
      };

      testHelper.verifyDocumentAccepted(doc, undefined, 'write');
    });

    it('refuses to replace an existing document even if its properties have not been modified', function() {
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

    it('refuses to delete an existing document', function() {
      var oldDoc = {
        _id: 'immutableDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentNotDeleted(oldDoc, 'immutableDoc', errorFormatter.immutableDocViolation());
    });

    it('refuses to allow modification of attachments after the document has been created', function() {
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

  describe('cannot replace document constraint', function() {
    it('allows a document to be created if the old document does not exist', function() {
      var doc = {
        _id: 'cannotReplaceDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a document to be created if the old document was deleted', function() {
      var doc = {
        _id: 'cannotReplaceDoc',
        stringProp: 'barfoo'
      };
      var oldDoc = { _id: 'cannotReplaceDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('allows a document to be deleted', function() {
      var oldDoc = {
        _id: 'cannotReplaceDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('allows a document to be deleted if the old document was already deleted', function() {
      // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
      // that it works properly
      var oldDoc = { _id: 'cannotReplaceDoc', _deleted: true };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('allows a document to be deleted if the old document does not exist', function() {
      // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
      // that it works properly
      var doc = {
        _id: 'cannotReplaceDoc',
        _deleted: true
      };

      testHelper.verifyDocumentAccepted(doc, undefined, 'write');
    });

    it('refuses to replace an existing document even if its properties have not been modified', function() {
      var doc = {
        _id: 'cannotReplaceDoc',
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'cannotReplaceDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'cannotReplaceDoc', 'documents of this type cannot be replaced');
    });

    it('refuses to allow modification of attachments after the document has been created', function() {
      var doc = {
        _id: 'cannotReplaceDoc',
        _attachments: {
          'bar.pdf': {
            'content_type': 'application/pdf'
          }
        },
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'cannotReplaceDoc',
        _attachments: {
          'foo.pdf': {
            'content_type': 'application/pdf'
          }
        },
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'cannotReplaceDoc', 'documents of this type cannot be replaced');
    });
  });

  describe('cannot delete document constraint', function() {
    it('allows a document to be created if the old document does not exist', function() {
      var doc = {
        _id: 'cannotDeleteDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a document to be created if the old document was deleted', function() {
      var doc = {
        _id: 'cannotDeleteDoc',
        stringProp: 'barfoo'
      };
      var oldDoc = { _id: 'cannotDeleteDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('allows a document to be deleted if the old document was already deleted', function() {
      // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
      // that it works properly
      var oldDoc = { _id: 'cannotDeleteDoc', _deleted: true };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('allows a document to be deleted if the old document does not exist', function() {
      // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
      // that it works properly
      var doc = {
        _id: 'cannotDeleteDoc',
        _deleted: true
      };

      testHelper.verifyDocumentAccepted(doc, undefined, 'write');
    });

    it('allows a document to be replaced', function() {
      var doc = {
        _id: 'cannotDeleteDoc',
        stringProp: 'barfoo'
      };
      var oldDoc = {
        _id: 'cannotDeleteDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows modifification of attachments after the document has been created', function() {
      var doc = {
        _id: 'cannotDeleteDoc',
        _attachments: {
          'bar.pdf': {
            'content_type': 'application/pdf'
          }
        },
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'cannotDeleteDoc',
        _attachments: {
          'foo.pdf': {
            'content_type': 'application/pdf'
          }
        },
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('refuses to delete an existing document', function() {
      var oldDoc = {
        _id: 'cannotDeleteDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentNotDeleted(oldDoc, 'cannotDeleteDoc', 'documents of this type cannot be deleted');
    });
  });
});
