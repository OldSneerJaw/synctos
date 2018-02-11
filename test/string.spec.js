const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('String validation type', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-string-sync-function.js');
  });

  describe('length constraints', () => {
    describe('with static validation', () => {
      it('can create a doc with a string that is within the minimum and maximum lengths', () => {
        const doc = {
          _id: 'stringDoc',
          staticLengthValidationProp: 'foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('cannot create a doc with a string that is shorter than the minimum length', () => {
        const doc = {
          _id: 'stringDoc',
          staticLengthValidationProp: 'fo'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.minimumLengthViolation('staticLengthValidationProp', 3));
      });

      it('cannot create a doc with a string that is longer than the maximum length', () => {
        const doc = {
          _id: 'stringDoc',
          staticLengthValidationProp: 'foob'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.maximumLengthViolation('staticLengthValidationProp', 3));
      });
    });

    describe('with dynamic validation', () => {
      it('allows a doc with a string that is within the minimum and maximum lengths', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicLengthValidationProp: 'foo',
          dynamicLengthPropertyIsValid: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that is shorter than the minimum length', () => {
        const doc = {
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

  describe('non-empty constraint', () => {
    describe('with static validation', () => {
      it('allows a doc with a string that is not empty', () => {
        const doc = {
          _id: 'stringDoc',
          staticNonEmptyValidationProp: 'foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty string', () => {
        const doc = {
          _id: 'stringDoc',
          staticNonEmptyValidationProp: ''
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustNotBeEmptyViolation('staticNonEmptyValidationProp'));
      });
    });

    describe('with dynamic validation', () => {
      it('allows a doc with a string that is not empty', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicNonEmptyValidationProp: 'bar',
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a doc with a string that is empty if the constraint is disabled', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicNonEmptyValidationProp: '',
          dynamicMustNotBeEmptyPropertiesEnforced: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty string if the constraint is enabled', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicNonEmptyValidationProp: '',
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustNotBeEmptyViolation('dynamicNonEmptyValidationProp'));
      });
    });
  });

  describe('regular expression pattern constraint', () => {
    describe('with static validation', () => {
      it('allows a doc with a string that matches the expected pattern', () => {
        const doc = {
          _id: 'stringDoc',
          staticRegexPatternValidationProp: '0472`foo'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that does not match the expected pattern', () => {
        const doc = {
          _id: 'stringDoc',
          staticRegexPatternValidationProp: 'foobar'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'stringDoc',
          errorFormatter.regexPatternItemViolation('staticRegexPatternValidationProp', /^\d+`[a-z]+$/));
      });
    });

    describe('with dynamic validation', () => {
      const testRegexPattern = '^[a-zA-Z]+$';

      it('allows a doc with a string that matches the expected pattern', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicRegexPatternValidationProp: 'fooBAR',
          dynamicRegex: testRegexPattern
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that does not match the expected pattern', () => {
        const doc = {
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

  describe('must be trimmed constraint', () => {
    describe('with static validation', () => {
      it('allows an empty string', () => {
        const doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: ''
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a string that has no leading or trailing whitespace', () => {
        const doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: 'foo bar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a string that has leading whitespace', () => {
        const doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: '\tfoo bar'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustBeTrimmedViolation('staticMustBeTrimmedValidationProp'));
      });

      it('blocks a string that has trailing whitespace', () => {
        const doc = {
          _id: 'stringDoc',
          staticMustBeTrimmedValidationProp: 'foo bar\n'
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustBeTrimmedViolation('staticMustBeTrimmedValidationProp'));
      });
    });

    describe('with dynamic validation', () => {
      it('allows a string that has no leading or trailing whitespace', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: 'bar',
          dynamicMustBeTrimmedState: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a string that has leading whitespace if the constraint is disabled', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: ' foobar',
          dynamicMustBeTrimmedState: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a string that has trailing whitespace if the constraint is disabled', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: 'foobar ',
          dynamicMustBeTrimmedState: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a string that has leading and trailing whitespace if the constraint is enabled', () => {
        const doc = {
          _id: 'stringDoc',
          dynamicMustBeTrimmedValidationProp: ' foobar ',
          dynamicMustBeTrimmedState: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'stringDoc', errorFormatter.mustBeTrimmedViolation('dynamicMustBeTrimmedValidationProp'));
      });
    });
  });
});
