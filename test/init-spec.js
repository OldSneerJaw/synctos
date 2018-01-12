var expect = require('chai').expect;
var testHelper = require('../src/test-helper.js');

describe('Test helper module initialization', function() {
  describe('when initialized from a generated sync function file', function() {
    it('loads the sync function successfully for a valid path', function() {
      testHelper.initSyncFunction('build/sync-functions/test-init-sync-function.js');

      var doc = {
        _id: 'foobar',
        type: 'initDoc',
        testProp: 174.6
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('fails to load the sync function for a file that does not exist', function() {
      try {
        testHelper.initSyncFunction('build/sync-functions/test-nonexistant-sync-function.js');
        expect.fail('Expected exception not thrown');
      } catch(ex) {
        expect(ex.code).to.equal('ENOENT');
      }
    });
  });

  describe('when initialized from a document definitions file', function() {
    it('loads the sync function successfully for a valid path', function() {
      testHelper.initDocumentDefinitions('test/resources/init-doc-definitions.js');

      var doc = {
        _id: 'barfoo',
        type: 'initDoc',
        testProp: -97.99
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('fails to load the sync function for a file that does not exist', function() {
      try {
        testHelper.initDocumentDefinitions('test/resources/nonexistant-doc-definitions.js');
        expect.fail('Expected exception not thrown');
      } catch (ex) {
        expect(ex.code).to.equal('ENOENT');
      }
    });
  });
});
