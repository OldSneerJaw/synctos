const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Simple type filter:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-simple-type-filter-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  function testSimpleTypeFilter(docTypeId) {
    it('identifies a brand new document by its type property', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('identifies a new document that is replacing a deleted document by its type property', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };
      const oldDoc = {
        _id: 'my-doc',
        _deleted: true
      };

      testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('identifies an updated document by its type property when it matches that of the old document', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };
      const oldDoc = {
        _id: 'my-doc',
        type: docTypeId
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('identifies a deleted document by the type property of the old document', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: docTypeId
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('refuses to identify an updated document by its type property when it differs from that of the old document', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };
      const oldDoc = {
        _id: 'my-doc',
        type: 'somethingElse'
      };

      testFixture.verifyUnknownDocumentType(doc, oldDoc);
    });

    it('cannot identify a document when the type property is not set', () => {
      const doc = {
        _id: 'my-doc'
      };

      testFixture.verifyUnknownDocumentType(doc);
    });

    it('cannot identify a document when the type property is set to an unknown type', () => {
      const doc = {
        _id: 'my-doc',
        type: 'somethingElse'
      };

      testFixture.verifyUnknownDocumentType(doc);
    });

    it('cannot identify a deleted document when the old document does not exist', () => {
      const doc = {
        _id: 'my-doc',
        _deleted: true
      };

      // When deleting a document that does not exist and the document's type cannot be determined, the fallback
      // behaviour is to allow it to be deleted by admins only
      testFixture.verifyDocumentAccepted(doc, void 0, [ ]);
    });

    it('cannot identify a deleted document when the old document is also deleted', () => {
      const doc = {
        _id: 'my-doc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'my-doc',
        _deleted: true
      };

      // When deleting a document that was already deleted and the document's type cannot be determined, the fallback
      // behaviour is to allow it to be deleted by admins only
      testFixture.verifyDocumentAccepted(doc, oldDoc, [ ]);
    });
  }

  describe('when a type property validator is explicitly defined', () => {
    testSimpleTypeFilter('myExplicitTypeValidatorDoc');
  });

  describe('when a type property validator is implied (i.e. not defined)', () => {
    testSimpleTypeFilter('myImplicitTypeValidatorDoc');
  });
});
