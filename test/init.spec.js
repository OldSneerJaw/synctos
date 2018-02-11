const { expect } = require('chai');
const testHelper = require('../src/testing/test-helper');

describe('Test helper module initialization', () => {
  describe('when initialized from a generated sync function file', () => {
    it('loads the sync function successfully for a valid path', () => {
      testHelper.initSyncFunction('build/sync-functions/test-init-sync-function.js');

      const doc = {
        _id: 'foobar',
        type: 'initDoc',
        testProp: 174.6
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('fails to load the sync function for a file that does not exist', () => {
      let syncFuncError = null;
      expect(() => {
        try {
          testHelper.initSyncFunction('build/sync-functions/test-nonexistant-sync-function.js');
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
      testHelper.initDocumentDefinitions('test/resources/init-doc-definitions.js');

      const doc = {
        _id: 'barfoo',
        type: 'initDoc',
        testProp: -97.99
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('fails to load the sync function for a file that does not exist', () => {
      let syncFuncError = null;
      expect(() => {
        try {
          testHelper.initDocumentDefinitions('test/resources/nonexistant-doc-definitions.js');
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(syncFuncError.code).to.equal('ENOENT');
    });
  });
});
