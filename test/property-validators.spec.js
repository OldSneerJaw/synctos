var testHelper = require('../src/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Property validators:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-property-validators-sync-function.js');
  });

  describe('static validation at the document level', function() {
    it('allow unknown properties when a document is created and the option is enabled', function() {
      var doc = {
        _id: 'staticAllowUnknownDoc',
        unknownProperty1: 15
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow unknown properties when a document is replaced and the option is enabled', function() {
      var doc = {
        _id: 'staticAllowUnknownDoc',
        unknownProperty1: 'foo'
      };
      var oldDoc = {
        _id: 'staticAllowUnknownDoc',
        unknownProperty2: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('reject unknown properties when a document is created and the option is disabled', function() {
      var doc = {
        _id: 'staticPreventUnknownDoc',
        unknownProperty1: 15
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticPreventUnknownDoc', [ errorFormatter.unsupportedProperty('unknownProperty1') ]);
    });

    it('reject unknown properties when a document is replaced and the option is disabled', function() {
      var doc = {
        _id: 'staticPreventUnknownDoc',
        unknownProperty1: 73.7
      };
      var oldDoc = { _id: 'staticPreventUnknownDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'staticPreventUnknownDoc', [ errorFormatter.unsupportedProperty('unknownProperty1') ]);
    });
  });

  describe('dynamic validation at the document level', function() {
    it('allows a document with no unknown properties', function() {
      var doc = {
        _id: 'foobar',
        type: 'dynamicPropertiesValidationDoc',
        extraProperty: 1.5,
        unknownPropertiesAllowed: false
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a document with unknown properties when they are enabled', function() {
      var doc = {
        _id: 'foobar',
        type: 'dynamicPropertiesValidationDoc',
        unrecognizedProperty: 'foobar',
        unknownPropertiesAllowed: true
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('blocks a document with unknown properties when they are disabled', function() {
      var doc = {
        _id: 'my-doc',
        type: 'dynamicPropertiesValidationDoc',
        extraProperty: 99, // Since the ID is not "foobar", extraProperty is expected to be a string
        unrecognizedProperty: [ ],
        unknownPropertiesAllowed: false
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicPropertiesValidationDoc',
        [
          errorFormatter.unsupportedProperty('unrecognizedProperty'),
          errorFormatter.typeConstraintViolation('extraProperty', 'string')
        ]);
    });
  });

  describe('static validation in a nested object', function() {
    it('allow unknown properties when a document is created and the option is enabled', function() {
      var doc = {
        _id: 'staticPreventUnknownDoc',
        allowUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow unknown properties when a document is replaced and the option is enabled', function() {
      var doc = {
        _id: 'staticPreventUnknownDoc',
        allowUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };
      var oldDoc = { _id: 'staticPreventUnknownDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('reject unknown properties when a document is created and the option is disabled', function() {
      var doc = {
        _id: 'staticAllowUnknownDoc',
        preventUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticAllowUnknownDoc',
        [ errorFormatter.unsupportedProperty('preventUnknownProp.myUnknownProp') ]);
    });

    it('reject unknown properties when a document is replaced and the option is disabled', function() {
      var doc = {
        _id: 'staticAllowUnknownDoc',
        preventUnknownProp: {
          myStringProp: 'foo',
          myUnknownProp: 'bar'
        }
      };
      var oldDoc = { _id: 'staticAllowUnknownDoc' };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'staticAllowUnknownDoc',
        [ errorFormatter.unsupportedProperty('preventUnknownProp.myUnknownProp') ]);
    });
  });

  describe('dynamic validation in a nested object', function() {
    it('allows a document with no nested unknown properties', function() {
      var doc = {
        _id: 'foobar',
        type: 'dynamicObjectValidationDoc',
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
        type: 'dynamicObjectValidationDoc',
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
        type: 'dynamicObjectValidationDoc',
        subObject: {
          extraProperty: 99, // Since the ID is not "foobar", extraProperty is expected to be a string
          unrecognizedProperty: [ ],
          unknownPropertiesAllowed: false
        }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicObjectValidationDoc',
        [
          errorFormatter.unsupportedProperty('subObject.unrecognizedProperty'),
          errorFormatter.typeConstraintViolation('subObject.extraProperty', 'string')
        ]);
    });
  });
});
