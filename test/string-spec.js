var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('String validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-string-sync-function.js');
  });

  describe('length constraints', function() {
    describe('with static validation', function() {
      it('can create a doc with a string that is within the minimum and maximum lengths', function() {
        var doc = {
          _id: 'stringDoc',
          staticLengthValidationProp: 'foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('cannot create a doc with a string that is shorter than the minimum length', function() {
        var doc = {
          _id: 'stringDoc',
          staticLengthValidationProp: 'fo'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.minimumLengthViolation('staticLengthValidationProp', 3));
      });

      it('cannot create a doc with a string that is longer than the maximum length', function() {
        var doc = {
          _id: 'stringDoc',
          staticLengthValidationProp: 'foob'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.maximumLengthViolation('staticLengthValidationProp', 3));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a doc with a string that is within the minimum and maximum lengths', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicLengthValidationProp: 'foo',
          dynamicLengthPropertyIsValid: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that is shorter than the minimum length', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicLengthValidationProp: 'foobar',
          dynamicLengthPropertyIsValid: false
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [
            errorFormatter.minimumLengthViolation('dynamicLengthValidationProp', 7),
            errorFormatter.maximumLengthViolation('dynamicLengthValidationProp', 5)
          ]);
      });
    });
  });

  describe('non-empty constraint', function() {
    describe('with static validation', function() {
      it('allows a doc with a string that is not empty', function() {
        var doc = {
          _id: 'stringDoc',
          staticNonEmptyProp: 'foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty string', function() {
        var doc = {
          _id: 'stringDoc',
          staticNonEmptyProp: ''
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustNotBeEmptyViolation('staticNonEmptyProp'));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a doc with a string that is not empty', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicNonEmptyProp: 'bar',
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a doc with a string that is empty if the constraint is disabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicNonEmptyProp: '',
          dynamicMustNotBeEmptyPropertiesEnforced: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty string if the constraint is enabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicNonEmptyProp: '',
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustNotBeEmptyViolation('dynamicNonEmptyProp'));
      });
    });
  });
});
