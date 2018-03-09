const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Underscore.js library', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-underscore-js-sync-function.js');
  });

  it('allows a document that satisfies a custom validation constraint implemented with Underscore.js', () => {
    const doc = {
      _id: 'my-doc',
      type: 'underscoreDoc',
      myProp: 'foo.bar'
    };

    testFixture.verifyDocumentCreated(doc);
  });

  it('rejects a document that fails a custom validation constraint implemented with Underscore.js', () => {
    const doc = {
      _id: 'my-doc',
      type: 'underscoreDoc',
      myProp: 'foo & bar'
    };

    testFixture.verifyDocumentNotCreated(doc, 'underscoreDoc', 'escaped value of "myProp" does not match raw value');
  });
});
