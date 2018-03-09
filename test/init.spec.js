const { expect } = require('chai');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Test fixture module initialization', () => {
  describe('when initialized from a generated sync function file', () => {
    it('loads the sync function successfully for a valid path', () => {
      const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-init-sync-function.js');

      const doc = {
        _id: 'foobar',
        type: 'initDoc',
        testProp: 174.6
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('fails to load the sync function for a file that does not exist', () => {
      let syncFuncError = null;
      expect(() => {
        try {
          testFixtureMaker.initFromSyncFunction('build/sync-functions/test-nonexistant-sync-function.js');
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(syncFuncError.code).to.equal('ENOENT');
    });
  });

  describe('when initialized from a document definitions file', () => {
    it('loads the sync function successfully for a valid path', () => {
      const testFixture = testFixtureMaker.initFromDocumentDefinitions('test/resources/init-doc-definitions.js');

      const doc = {
        _id: 'barfoo',
        type: 'initDoc',
        testProp: -97.99
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('fails to load the sync function for a file that does not exist', () => {
      let syncFuncError = null;
      expect(() => {
        try {
          testFixtureMaker.initFromDocumentDefinitions('test/resources/nonexistant-doc-definitions.js');
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(syncFuncError.code).to.equal('ENOENT');
    });
  });
});
