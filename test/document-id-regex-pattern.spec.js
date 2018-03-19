const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Document ID regular expression pattern constraint:', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-document-id-regex-pattern-sync-function.js');
  });

  describe('with a static constraint value', () => {
    it('allows creation of a document whose ID matches the pattern', () => {
      const doc = {
        _id: 'my-doc.12345',
        type: 'staticDocumentIdRegexPatternDoc'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows replacement of a document even if the ID does not match the pattern', () => {
      const oldDoc = {
        _id: 'invalid-doc-id',
        type: 'staticDocumentIdRegexPatternDoc'
      };
      const doc = {
        _id: 'invalid-doc-id',
        type: 'staticDocumentIdRegexPatternDoc'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows deletion of a document even if the ID does not match the pattern', () => {
      const oldDoc = {
        _id: 'invalid-doc-id',
        type: 'staticDocumentIdRegexPatternDoc'
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('rejects creation of a document whose ID does not match the pattern', () => {
      const doc = {
        _id: 'my-doc.1abcd',
        type: 'staticDocumentIdRegexPatternDoc'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticDocumentIdRegexPatternDoc',
        [ errorFormatter.documentIdRegexPatternViolation(/^my-doc\.\d+$/) ]);
    });
  });

  describe('with a dynamic constraint value', () => {
    it('allows creation of a document whose ID matches the pattern', () => {
      const entityId = 'my-arbitrary-entity';
      const doc = {
        _id: `entity.${entityId}`,
        type: 'dynamicDocumentIdRegexPatternDoc',
        entityId: entityId
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows replacement of a document even if the ID does not match the pattern', () => {
      const oldDoc = {
        _id: 'entity.mismatched-id',
        type: 'dynamicDocumentIdRegexPatternDoc',
        entityId: 'my-entity'
      };
      const doc = {
        _id: 'entity.mismatched-id',
        type: 'dynamicDocumentIdRegexPatternDoc',
        entityId: 'my-entity'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows deletion of a document even if the ID does not match the pattern', () => {
      const oldDoc = {
        _id: 'entity.mismatched-id',
        type: 'dynamicDocumentIdRegexPatternDoc',
        entityId: 'my-entity'
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('rejects creation of a document whose ID does not match the pattern', () => {
      const entityId = 'my-entity';
      const doc = {
        _id: 'entity.mismatched-id',
        type: 'dynamicDocumentIdRegexPatternDoc',
        entityId: entityId
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDocumentIdRegexPatternDoc',
        [ errorFormatter.documentIdRegexPatternViolation(new RegExp('^entity\\.' + entityId + '$')) ]);
    });
  });
});
