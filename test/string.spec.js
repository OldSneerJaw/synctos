var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('String validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-string-sync-function.js');
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
          staticNonEmptyValidationProp: 'foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty string', function() {
        var doc = {
          _id: 'stringDoc',
          staticNonEmptyValidationProp: ''
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustNotBeEmptyViolation('staticNonEmptyValidationProp'));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a doc with a string that is not empty', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicNonEmptyValidationProp: 'bar',
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a doc with a string that is empty if the constraint is disabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicNonEmptyValidationProp: '',
          dynamicMustNotBeEmptyPropertiesEnforced: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty string if the constraint is enabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicNonEmptyValidationProp: '',
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustNotBeEmptyViolation('dynamicNonEmptyValidationProp'));
      });
    });
  });

  describe('regular expression pattern constraint', function() {
    describe('with static validation', function() {
      it('allows a doc with a string that matches the expected pattern', function() {
        var doc = {
          _id: 'stringDoc',
          staticRegexPatternValidationProp: '0472`foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that does not match the expected pattern', function() {
        var doc = {
          _id: 'stringDoc',
          staticRegexPatternValidationProp: 'foobar'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          errorFormatter.regexPatternItemViolation('staticRegexPatternValidationProp', /^\d+`[a-z]+$/));
      });
    });

    describe('with dynamic validation', function() {
      var testRegexPattern = '^[a-zA-Z]+$';

      it('allows a doc with a string that matches the expected pattern', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicRegexPatternValidationProp: 'fooBAR',
          dynamicRegex: testRegexPattern
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that does not match the expected pattern', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicRegexPatternValidationProp: 'foobar2',
          dynamicRegex: testRegexPattern
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          errorFormatter.regexPatternItemViolation('dynamicRegexPatternValidationProp', new RegExp(testRegexPattern)));
      });
    });
  });

  describe('must be trimmed constraint', function() {
    describe('with static validation', function() {
      it('allows an empty string', function() {
        var doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: ''
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a string that has no leading or trailing whitespace', function() {
        var doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: 'foo bar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a string that has leading whitespace', function() {
        var doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: '\tfoo bar'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustBeTrimmedViolation('staticMustBeTrimmedValidationProp'));
      });

      it('blocks a string that has trailing whitespace', function() {
        var doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: 'foo bar\n'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustBeTrimmedViolation('staticMustBeTrimmedValidationProp'));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a string that has no leading or trailing whitespace', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: 'bar',
          dynamicMustBeTrimmedState: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a string that has leading whitespace if the constraint is disabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: ' foobar',
          dynamicMustBeTrimmedState: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a string that has trailing whitespace if the constraint is disabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: 'foobar ',
          dynamicMustBeTrimmedState: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a string that has leading and trailing whitespace if the constraint is enabled', function() {
        var doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: ' foobar ',
          dynamicMustBeTrimmedState: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustBeTrimmedViolation('dynamicMustBeTrimmedValidationProp'));
      });
    });
  });

  describe('inclusive range constraints', () => {
    describe('with static validation', () => {
      it('allows a value that falls between the minimum and maximum values', () => {
        const doc = {
          _id: 'stringDoc',
          staticInclusiveRangeValidationProp: 'Right'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a value that matches the minimum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticInclusiveRangeValidationProp: 'A'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a value that matches the maximum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticInclusiveRangeValidationProp: 'Z'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects a value that is less than the minimum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticInclusiveRangeValidationProp: '9'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.minimumValueViolation('staticInclusiveRangeValidationProp', 'A') ]);
      });

      it('rejects a value that is greater than the maximum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticInclusiveRangeValidationProp: 'wrong'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.maximumValueViolation('staticInclusiveRangeValidationProp', 'Z') ]);
      });
    });

    describe('with dynamic validation', () => {
      it('allows a value that falls between the minimum and maximum values', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMinimumValue: '5',
          dynamicMaximumValue: '5999',
          dynamicInclusiveRangeValidationProp: '54'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects a value that is less than the minimum value', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMinimumValue: '3',
          dynamicMaximumValue: '4',
          dynamicInclusiveRangeValidationProp: '2.99999'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.minimumValueViolation('dynamicInclusiveRangeValidationProp', '3') ]);
      });

      it('rejects a value that is greater than the maximum value', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMinimumValue: 'a',
          dynamicMaximumValue: 'z',
          dynamicInclusiveRangeValidationProp: '{'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.maximumValueViolation('dynamicInclusiveRangeValidationProp', 'z') ]);
      });
    });
  });

  describe('exclusive range constraints', () => {
    describe('with static validation', () => {
      it('allows a value that falls between the minimum and maximum values', () => {
        const doc = {
          _id: 'stringDoc',
          staticExclusiveRangeValidationProp: 'aaa'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects a value that matches the minimum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticExclusiveRangeValidationProp: 'aa'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.minimumValueExclusiveViolation('staticExclusiveRangeValidationProp', 'aa') ]);
      });

      it('rejects a value that matches the maximum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticExclusiveRangeValidationProp: 'c'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.maximumValueExclusiveViolation('staticExclusiveRangeValidationProp', 'c') ]);
      });

      it('rejects a value that is less than the minimum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticExclusiveRangeValidationProp: 'a'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.minimumValueExclusiveViolation('staticExclusiveRangeValidationProp', 'aa') ]);
      });

      it('rejects a value that is greater than the maximum value', () => {
        const doc = {
          _id: 'stringDoc',
          staticExclusiveRangeValidationProp: 'cc'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.maximumValueExclusiveViolation('staticExclusiveRangeValidationProp', 'c') ]);
      });
    });

    describe('with dynamic validation', () => {
      it('allows a value that falls between the minimum and maximum values', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMinimumValue: '@',
          dynamicMaximumValue: '[',
          dynamicExclusiveRangeValidationProp: 'Good'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects a value that matches the minimum value', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMinimumValue: 'F',
          dynamicMaximumValue: 'f',
          dynamicExclusiveRangeValidationProp: 'F'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.minimumValueExclusiveViolation('dynamicExclusiveRangeValidationProp', 'F') ]);
      });

      it('rejects a value that matches the maximum value', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMinimumValue: '{',
          dynamicMaximumValue: '}',
          dynamicExclusiveRangeValidationProp: '}'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          [ errorFormatter.maximumValueExclusiveViolation('dynamicExclusiveRangeValidationProp', '}') ]);
      });
    });
  });
});
