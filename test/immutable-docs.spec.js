const testHelper = require('../src/testing/test-helper.js');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Immutable document validation:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-immutable-docs-sync-function.js');
  });

  describe('full document immutability constraint', function() {
    describe('with static validation', function() {
      it('allows a document to be created if the old document does not exist', function() {
        const doc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a document to be created if the old document was deleted', function() {
        const doc = {
          _id: 'staticImmutableDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = { _id: 'staticImmutableDoc', _deleted: true };

        testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
      });

      it('allows a document to be deleted if the old document was already deleted', function() {
        // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
        // that it works properly
        const oldDoc = { _id: 'staticImmutableDoc', _deleted: true };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document does not exist', function() {
        // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
        // that it works properly
        const doc = {
          _id: 'staticImmutableDoc',
          _deleted: true
        };

        testHelper.verifyDocumentAccepted(doc, void 0, 'write');
      });

      it('refuses to replace an existing document even if its properties have not been modified', function() {
        const doc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'staticImmutableDoc', errorFormatter.immutableDocViolation());
      });

      it('refuses to delete an existing document', function() {
        const oldDoc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentNotDeleted(oldDoc, 'staticImmutableDoc', errorFormatter.immutableDocViolation());
      });

      it('refuses to allow modification of attachments after the document has been created', function() {
        const doc = {
          _id: 'staticImmutableDoc',
          _attachments: {
            'bar.pdf': {
              'content_type': 'application/pdf'
            }
          },
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticImmutableDoc',
          _attachments: {
            'foo.pdf': {
              'content_type': 'application/pdf'
            }
          },
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'staticImmutableDoc', errorFormatter.immutableDocViolation());
      });
    });

    describe('with dynamic validation', function() {
      it('allows a new document to be created', function() {
        const doc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 17,
          applyImmutability: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a document to be replaced if the constraint is disabled', function() {
        const doc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 71,
          applyImmutability: true
        };
        const oldDoc = {
          _id: 'dynamicImmutableDoc',
          integerProp: -81,
          applyImmutability: false
        };

        testHelper.verifyDocumentReplaced(doc, oldDoc);
      });

      it('allows a document to be deleted if the constraint is disabled', function() {
        const oldDoc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 909,
          applyImmutability: false
        };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('blocks a document from being replaced if the constraint is enabled', function() {
        const doc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 7,
          applyImmutability: false
        };
        const oldDoc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 14,
          applyImmutability: true
        };

        testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'dynamicImmutableDoc', errorFormatter.immutableDocViolation());
      });

      it('blocks a document from being deleted if the constraint is enabled', function() {
        const oldDoc = {
          _id: 'dynamicImmutableDoc',
          integerProp: -111,
          applyImmutability: true
        };

        testHelper.verifyDocumentNotDeleted(oldDoc, 'dynamicImmutableDoc', errorFormatter.immutableDocViolation());
      });
    });
  });

  describe('cannot replace document constraint', function() {
    describe('with static validation', function() {
      it('allows a document to be created if the old document does not exist', function() {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a document to be created if the old document was deleted', function() {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = { _id: 'staticCannotReplaceDoc', _deleted: true };

        testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
      });

      it('allows a document to be deleted', function() {
        const oldDoc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document was already deleted', function() {
        // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
        // that it works properly
        const oldDoc = { _id: 'staticCannotReplaceDoc', _deleted: true };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document does not exist', function() {
        // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
        // that it works properly
        const doc = {
          _id: 'staticCannotReplaceDoc',
          _deleted: true
        };

        testHelper.verifyDocumentAccepted(doc, void 0, 'write');
      });

      it('refuses to replace an existing document even if its properties have not been modified', function() {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'staticCannotReplaceDoc', errorFormatter.cannotReplaceDocViolation());
      });

      it('refuses to allow modification of attachments after the document has been created', function() {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          _attachments: {
            'bar.pdf': {
              'content_type': 'application/pdf'
            }
          },
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticCannotReplaceDoc',
          _attachments: {
            'foo.pdf': {
              'content_type': 'application/pdf'
            }
          },
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'staticCannotReplaceDoc', errorFormatter.cannotReplaceDocViolation());
      });
    });

    describe('with dynamic validation', function() {
      it('allows a new document to be created', function() {
        const doc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 0,
          applyImmutability: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a document to be deleted', function() {
        const oldDoc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 1,
          applyImmutability: true
        };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be replaced if the constraint is disabled', function() {
        const doc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 1,
          applyImmutability: true
        };
        const oldDoc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 0,
          applyImmutability: false
        };

        testHelper.verifyDocumentReplaced(doc, oldDoc);
      });

      it('blocks a document from being replaced if the constraint is enabled', function() {
        const doc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 2,
          applyImmutability: false
        };
        const oldDoc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 1,
          applyImmutability: true
        };

        testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'dynamicCannotReplaceDoc', errorFormatter.cannotReplaceDocViolation());
      });
    });
  });

  describe('cannot delete document constraint', function() {
    describe('with static validation', function() {
      it('allows a document to be created if the old document does not exist', function() {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a document to be created if the old document was deleted', function() {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = { _id: 'staticCannotDeleteDoc', _deleted: true };

        testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
      });

      it('allows a document to be deleted if the old document was already deleted', function() {
        // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
        // that it works properly
        const oldDoc = { _id: 'staticCannotDeleteDoc', _deleted: true };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document does not exist', function() {
        // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
        // that it works properly
        const doc = {
          _id: 'staticCannotDeleteDoc',
          _deleted: true
        };

        testHelper.verifyDocumentAccepted(doc, void 0, 'write');
      });

      it('allows a document to be replaced', function() {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentReplaced(doc, oldDoc);
      });

      it('allows modifification of attachments after the document has been created', function() {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          _attachments: {
            'bar.pdf': {
              'content_type': 'application/pdf'
            }
          },
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticCannotDeleteDoc',
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
        const oldDoc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'foobar'
        };

        testHelper.verifyDocumentNotDeleted(oldDoc, 'staticCannotDeleteDoc', errorFormatter.cannotDeleteDocViolation());
      });
    });

    describe('with dynamic validation', function() {
      it('allows a new document to be created', function() {
        const doc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 9,
          applyImmutability: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a document to be replaced', function() {
        const doc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 8,
          applyImmutability: true
        };
        const oldDoc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 9,
          applyImmutability: true
        };

        testHelper.verifyDocumentReplaced(doc, oldDoc);
      });

      it('allows a document to be deleted if the constraint is disabled', function() {
        const oldDoc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 7,
          applyImmutability: false
        };

        testHelper.verifyDocumentDeleted(oldDoc);
      });

      it('blocks a document from being deleted if the constraint is enabled', function() {
        const oldDoc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 6,
          applyImmutability: true
        };

        testHelper.verifyDocumentNotDeleted(oldDoc, 'dynamicCannotDeleteDoc', errorFormatter.cannotDeleteDocViolation());
      });
    });
  });
});
