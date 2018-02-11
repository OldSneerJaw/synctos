const testHelper = require('../src/testing/test-helper');

describe('Document definition fragments:', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-fragment-sync-function.js');
  });

  it('can create documents for a document type whose definition was imported with a single-quoted filename', () => {
    const doc = {
      _id: 'stringFragmentDoc',
      stringProp: '2017-01-06'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can create documents for a document type whose definition was imported with a double-quoted filename', () => {
    const doc = {
      _id: 'booleanFragmentDoc',
      booleanProp: true
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can create documents with nested imports', () => {
    const doc = {
      _id: 'objectFragmentDoc',
      type: 'nestedImportDoc',
      objectProp: { nestedProperty: -58 }
    };

    testHelper.verifyDocumentCreated(doc);
  });
});
