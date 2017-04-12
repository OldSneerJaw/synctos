var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Property validators:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-property-validators-sync-function.js');
  });

  describe('static validation at the document level', function() {
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

  describe('static validation in a nested object', function() {
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

  describe('dynamic validation in a nested object', function() {
    it('allows a document with no nested unknown properties', function() {
      var doc = {
        _id: 'foobar',
        type: 'dynamicValidationDoc',
        subObject: {
          extraProperty: 1.5,
          unknownPropertiesAllowed: false
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a document with nested unknown properties when they are enabled', function() {
      var doc = {
        _id: 'foobar',
        type: 'dynamicValidationDoc',
        subObject: {
          unrecognizedProperty: 'foobar',
          unknownPropertiesAllowed: true
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('blocks a document with nested unknown properties when they are disabled', function() {
      var doc = {
        _id: 'my-doc',
        type: 'dynamicValidationDoc',
        subObject: {
          extraProperty: 99, // Since the ID is not "foobar", extraProperty is expected to be a string
          unrecognizedProperty: [ ],
          unknownPropertiesAllowed: false
        }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicValidationDoc',
        [
          errorFormatter.unsupportedProperty('subObject.unrecognizedProperty'),
          errorFormatter.typeConstraintViolation('subObject.extraProperty', 'string')
        ]);
    });
  });
});
