var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Array validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-array-sync-function.js');
  });

  describe('length validation', function() {
    it('can create a doc with an array that is within the minimum and maximum lengths', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo', 'bar' ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with an array that is shorter than the minimum length', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo' ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.minimumLengthViolation('lengthValidationProp', 2));
    });

    it('cannot create a doc with an array that is longer than the maximum length', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo', 'bar', 'baz' ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.maximumLengthViolation('lengthValidationProp', 2));
    });
  });

  describe('non-empty constraint', function() {
    describe('with static validation', function() {
      it('allows a doc with an array that is not empty', function() {
        var doc = {
          _id: 'arrayDoc',
          staticNonEmptyProp: [ 'foo' ]
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty array', function() {
        var doc = {
          _id: 'arrayDoc',
          staticNonEmptyProp: [ ]
        };

        testHelper.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.mustNotBeEmptyViolation('staticNonEmptyProp'));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a doc with an array that is not empty', function() {
        var doc = {
          _id: 'arrayDoc',
          dynamicNonEmptyProp: [ 'foo' ],
          dynamicPropertiesMustNotBeEmpty: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a doc with an array that is empty if the constraint is disabled', function() {
        var doc = {
          _id: 'arrayDoc',
          dynamicNonEmptyProp: [ ],
          dynamicPropertiesMustNotBeEmpty: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty array if the constraint is enabled', function() {
        var doc = {
          _id: 'arrayDoc',
          dynamicNonEmptyProp: [ ],
          dynamicPropertiesMustNotBeEmpty: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.mustNotBeEmptyViolation('dynamicNonEmptyProp'));
      });
    });
  });
});
