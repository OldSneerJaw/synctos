const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Immutable document validation:', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-immutable-docs-sync-function.js');
  });

  describe('full document immutability constraint', () => {
    describe('with static validation', () => {
      it('allows a document to be created if the old document does not exist', () => {
        const doc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a document to be created if the old document was deleted', () => {
        const doc = {
          _id: 'staticImmutableDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = { _id: 'staticImmutableDoc', _deleted: true };

        testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
      });

      it('allows a document to be deleted if the old document was already deleted', () => {
        // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
        // that it works properly
        const oldDoc = { _id: 'staticImmutableDoc', _deleted: true };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document does not exist', () => {
        // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
        // that it works properly
        const doc = {
          _id: 'staticImmutableDoc',
          _deleted: true
        };

        testFixture.verifyDocumentAccepted(doc, void 0, 'write');
      });

      it('refuses to replace an existing document even if its properties have not been modified', () => {
        const doc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'staticImmutableDoc', errorFormatter.immutableDocViolation());
      });

      it('refuses to delete an existing document', () => {
        const oldDoc = {
          _id: 'staticImmutableDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentNotDeleted(oldDoc, 'staticImmutableDoc', errorFormatter.immutableDocViolation());
      });

      it('refuses to allow modification of attachments after the document has been created', () => {
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

        testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'staticImmutableDoc', errorFormatter.immutableDocViolation());
      });
    });

    describe('with dynamic validation', () => {
      it('allows a new document to be created', () => {
        const doc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 17,
          applyImmutability: true
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a document to be replaced if the constraint is disabled', () => {
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

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      it('allows a document to be deleted if the constraint is disabled', () => {
        const oldDoc = {
          _id: 'dynamicImmutableDoc',
          integerProp: 909,
          applyImmutability: false
        };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('blocks a document from being replaced if the constraint is enabled', () => {
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

        testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'dynamicImmutableDoc', errorFormatter.immutableDocViolation());
      });

      it('blocks a document from being deleted if the constraint is enabled', () => {
        const oldDoc = {
          _id: 'dynamicImmutableDoc',
          integerProp: -111,
          applyImmutability: true
        };

        testFixture.verifyDocumentNotDeleted(oldDoc, 'dynamicImmutableDoc', errorFormatter.immutableDocViolation());
      });
    });
  });

  describe('cannot replace document constraint', () => {
    describe('with static validation', () => {
      it('allows a document to be created if the old document does not exist', () => {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a document to be created if the old document was deleted', () => {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = { _id: 'staticCannotReplaceDoc', _deleted: true };

        testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
      });

      it('allows a document to be deleted', () => {
        const oldDoc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document was already deleted', () => {
        // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
        // that it works properly
        const oldDoc = { _id: 'staticCannotReplaceDoc', _deleted: true };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document does not exist', () => {
        // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
        // that it works properly
        const doc = {
          _id: 'staticCannotReplaceDoc',
          _deleted: true
        };

        testFixture.verifyDocumentAccepted(doc, void 0, 'write');
      });

      it('refuses to replace an existing document even if its properties have not been modified', () => {
        const doc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };
        const oldDoc = {
          _id: 'staticCannotReplaceDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'staticCannotReplaceDoc', errorFormatter.cannotReplaceDocViolation());
      });

      it('refuses to allow modification of attachments after the document has been created', () => {
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

        testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'staticCannotReplaceDoc', errorFormatter.cannotReplaceDocViolation());
      });
    });

    describe('with dynamic validation', () => {
      it('allows a new document to be created', () => {
        const doc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 0,
          applyImmutability: true
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a document to be deleted', () => {
        const oldDoc = {
          _id: 'dynamicCannotReplaceDoc',
          integerProp: 1,
          applyImmutability: true
        };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be replaced if the constraint is disabled', () => {
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

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      it('blocks a document from being replaced if the constraint is enabled', () => {
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

        testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'dynamicCannotReplaceDoc', errorFormatter.cannotReplaceDocViolation());
      });
    });
  });

  describe('cannot delete document constraint', () => {
    describe('with static validation', () => {
      it('allows a document to be created if the old document does not exist', () => {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a document to be created if the old document was deleted', () => {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = { _id: 'staticCannotDeleteDoc', _deleted: true };

        testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
      });

      it('allows a document to be deleted if the old document was already deleted', () => {
        // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
        // that it works properly
        const oldDoc = { _id: 'staticCannotDeleteDoc', _deleted: true };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('allows a document to be deleted if the old document does not exist', () => {
        // There doesn't seem to be much point in deleting something that doesn't exist, but since Sync Gateway allows you to do it, check
        // that it works properly
        const doc = {
          _id: 'staticCannotDeleteDoc',
          _deleted: true
        };

        testFixture.verifyDocumentAccepted(doc, void 0, 'write');
      });

      it('allows a document to be replaced', () => {
        const doc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'barfoo'
        };
        const oldDoc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      it('allows modifification of attachments after the document has been created', () => {
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

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      it('refuses to delete an existing document', () => {
        const oldDoc = {
          _id: 'staticCannotDeleteDoc',
          stringProp: 'foobar'
        };

        testFixture.verifyDocumentNotDeleted(oldDoc, 'staticCannotDeleteDoc', errorFormatter.cannotDeleteDocViolation());
      });
    });

    describe('with dynamic validation', () => {
      it('allows a new document to be created', () => {
        const doc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 9,
          applyImmutability: true
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a document to be replaced', () => {
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

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      it('allows a document to be deleted if the constraint is disabled', () => {
        const oldDoc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 7,
          applyImmutability: false
        };

        testFixture.verifyDocumentDeleted(oldDoc);
      });

      it('blocks a document from being deleted if the constraint is enabled', () => {
        const oldDoc = {
          _id: 'dynamicCannotDeleteDoc',
          integerProp: 6,
          applyImmutability: true
        };

        testFixture.verifyDocumentNotDeleted(oldDoc, 'dynamicCannotDeleteDoc', errorFormatter.cannotDeleteDocViolation());
      });
    });
  });
});
