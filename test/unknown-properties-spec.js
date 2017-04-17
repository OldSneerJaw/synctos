var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Unknown property handling:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-unknown-properties-sync-function.js');
  });

  describe('when unknown properties are specified at the document level', function() {
    it('allow unknown properties when a document is created and the option is enabled', function() {
      var doc = {
        _id: 'allowUnknownDoc',
        unknownProperty1: 15
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow unknown properties when a document is replaced and the option is enabled', function() {
      var doc = {
        _id: 'allowUnknownDoc',
        unknownProperty1: 'foo'
      };
      var oldDoc = {
        _id: 'allowUnknownDoc',
        unknownProperty2: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('reject unknown properties when a document is created and the option is disabled', function() {
      var doc = {
        _id: 'preventUnknownDoc',
        unknownProperty1: 15
      };

      testHelper.verifyDocumentNotCreated(doc, 'preventUnknownDoc', [ errorFormatter.unsupportedProperty('unknownProperty1') ]);
    });

    it('reject unknown properties when a document is replaced and the option is disabled', function() {
      var doc = {
        _id: 'preventUnknownDoc',
        unknownProperty1: 73.7
      };
      var oldDoc = { _id: 'preventUnknownDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'preventUnknownDoc', [ errorFormatter.unsupportedProperty('unknownProperty1') ]);
    });
  });

  describe('when unknown properties are specified in a nested object', function() {
    it('allow unknown properties when a document is created and the option is enabled', function() {
      var doc = {
        _id: 'preventUnknownDoc',
        allowUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow unknown properties when a document is replaced and the option is enabled', function() {
      var doc = {
        _id: 'preventUnknownDoc',
        allowUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };
      var oldDoc = { _id: 'preventUnknownDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('reject unknown properties when a document is created and the option is disabled', function() {
      var doc = {
        _id: 'allowUnknownDoc',
        preventUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'allowUnknownDoc',
        [ errorFormatter.unsupportedProperty('preventUnknownProp.myUnknownProp') ]);
    });

    it('reject unknown properties when a document is replaced and the option is disabled', function() {
      var doc = {
        _id: 'allowUnknownDoc',
        preventUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };
      var oldDoc = { _id: 'allowUnknownDoc' };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'allowUnknownDoc',
        [ errorFormatter.unsupportedProperty('preventUnknownProp.myUnknownProp') ]);
    });
  });
});
