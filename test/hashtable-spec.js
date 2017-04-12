var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Hashtable validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-hashtable-sync-function.js');
  });

  describe('size constraints', function() {
    describe('with static validation', function() {
      it('allows a hashtable that is within the minimum and maximum sizes', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticSizeValidationProp: {
            foo: 1,
            bar: 2
          }
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects a hashtable that is smaller than the minimum size', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticSizeValidationProp: {
            foo: 1
          }
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableMinimumSizeViolation('staticSizeValidationProp', 2));
      });

      it('rejects a hashtable that is larger than the maximum size', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticSizeValidationProp: {
            foo: 1,
            bar: 2,
            baz: 3
          }
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableMaximumSizeViolation('staticSizeValidationProp', 2));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a hashtable that is within the minimum and maximum sizes', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicSizeValidationProp: {
            foo: 1
          },
          dynamicSize: 1
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects a hashtable that is smaller than the minimum size', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicSizeValidationProp: {
            foo: 1
          },
          dynamicSize: 2
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableMinimumSizeViolation('dynamicSizeValidationProp', 2));
      });

      it('rejects a hashtable that is larger than the maximum size', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicSizeValidationProp: {
            foo: 1,
            bar: 2
          },
          dynamicSize: 1
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableMaximumSizeViolation('dynamicSizeValidationProp', 1));
      });
    });
  });

  describe('non-empty key constraint', function() {
    describe('with static validation', function() {
      it('allows a doc with a key that is not empty', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticNonEmptyKeyValidationProp: { 'foo': 'bar' }
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty key', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticNonEmptyKeyValidationProp: { '': 'bar' }
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableKeyEmpty('staticNonEmptyKeyValidationProp'));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a doc with a key that is not empty', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicNonEmptyKeyValidationProp: { 'foo': 'bar' },
          dynamicKeysMustNotBeEmpty: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a doc with an empty key when the constraint is disabled', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicNonEmptyKeyValidationProp: { '': 'bar' },
          dynamicKeysMustNotBeEmpty: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty key when the constraint is enabled', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicNonEmptyKeyValidationProp: { '': 'bar' },
          dynamicKeysMustNotBeEmpty: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableKeyEmpty('dynamicNonEmptyKeyValidationProp'));
      });
    });
  });

  describe('key regular expression pattern constraint', function() {
    describe('with static validation', function() {
      it('allows a doc when all keys match the expected pattern', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticKeyRegexPatternValidationProp: {
            'Foobar': 'baz',
            'Baz': 'qux'
          }
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc when a key does not match the expected pattern', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticKeyRegexPatternValidationProp: {
            '123': 'foo',
            'bar': 'baz'
          }
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'hashtableDoc',
          errorFormatter.regexPatternHashtableKeyViolation('staticKeyRegexPatternValidationProp[123]', /^[a-zA-Z]+$/));
      });
    });

    describe('with dynamic validation', function() {
      var testRegexPattern = '^\\d+$';

      it('allows a doc with a string that matches the expected pattern', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicKeyRegexPatternValidationProp: {
            '1': 'foo',
            '2': 'bar'
          },
          dynamicKeyRegex: testRegexPattern
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with a string that does not match the expected pattern', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicKeyRegexPatternValidationProp: {
            '1': 'foo',
            'bar': 'baz'
          },
          dynamicKeyRegex: testRegexPattern
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'hashtableDoc',
          errorFormatter.regexPatternHashtableKeyViolation('dynamicKeyRegexPatternValidationProp[bar]', new RegExp(testRegexPattern)));
      });
    });
  });
});
