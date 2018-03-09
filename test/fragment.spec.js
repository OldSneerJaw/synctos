const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Document definition fragments:', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-fragment-sync-function.js');
  });

  it('can create documents for a document type whose definition was imported with a single-quoted filename', () => {
    const doc = {
      _id: 'stringFragmentDoc',
      stringProp: '2017-01-06'
    };

    testFixture.verifyDocumentCreated(doc);
  });

  it('can create documents for a document type whose definition was imported with a double-quoted filename', () => {
    const doc = {
      _id: 'booleanFragmentDoc',
      booleanProp: true
    };

    testFixture.verifyDocumentCreated(doc);
  });

  it('can create documents with nested imports', () => {
    const doc = {
      _id: 'objectFragmentDoc',
      type: 'nestedImportDoc',
      objectProp: { nestedProperty: -58 }
    };

    testFixture.verifyDocumentCreated(doc);
  });
});
