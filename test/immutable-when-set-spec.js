var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Immutable when set constraint:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-immutable-when-set-sync-function.js');
  });

  describe('a property with static validation', function() {
    it('can be set to a value in a new document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can be left undefined in a new document', function() {
      var doc = {
        _id: 'myDoc'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can be set to null in a new document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: null
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can be set to the same value as was already assigned in the old document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a value if it was left undefined in the old document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };
      var oldDoc = {
        _id: 'myDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a value if it was null in the old document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to null if it was undefined in the old document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: null
      };
      var oldDoc = {
        _id: 'myDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to undefined if it was null in the old document', function() {
      var doc = {
        _id: 'myDoc'
      };
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot be changed to a new value if it was set to a value in the old document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: 'barfoo'
      };
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('staticValidationProp'));
    });

    it('cannot be change to undefined if it was set to a value in the old document', function() {
      var doc = {
        _id: 'myDoc'
      };
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('staticValidationProp'));
    });

    it('cannot be changed to null if it was set to a value in the old document', function() {
      var doc = {
        _id: 'myDoc',
        staticValidationProp: null
      };
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('staticValidationProp'));
    });

    it('does not prevent a document from being deleted if it is set to a value', function() {
      var oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });
  });

  describe('a property with dynamic validation', function() {
    it('can be set to the same value as was already assigned in the old document', function() {
      var doc = {
        _id: 'myDoc',
        dynamicValidationProp: 42,
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'myDoc',
        dynamicValidationProp: 42,
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a new value if the property is not immutable', function() {
      var doc = {
        _id: 'myDoc',
        dynamicValidationProp: -1,
        dynamicPropertiesAreImmutable: false
      };
      var oldDoc = {
        _id: 'myDoc',
        dynamicValidationProp: 42,
        dynamicPropertiesAreImmutable: false
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a new value if the property is immutable', function() {
      var doc = {
        _id: 'myDoc',
        dynamicValidationProp: 0,
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'myDoc',
        dynamicValidationProp: -1,
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('dynamicValidationProp'));
    });
  });
});
