var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Hashtable validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-hashtable-sync-function.js');
  });

  describe('size validation', function() {
    it('allows a hashtable that is within the minimum and maximum sizes', function() {
      var doc = {
        _id: 'hashtableDoc',
        sizeValidationProp: {
          foo: 1,
          bar: 2
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a hashtable that is smaller than the minimum size', function() {
      var doc = {
        _id: 'hashtableDoc',
        sizeValidationProp: {
          foo: 1
        }
      };

      testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableMinimumSizeViolation('sizeValidationProp', 2));
    });

    it('rejects a hashtable that is larger than the maximum size', function() {
      var doc = {
        _id: 'hashtableDoc',
        sizeValidationProp: {
          foo: 1,
          bar: 2,
          baz: 3
        }
      };

      testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableMaximumSizeViolation('sizeValidationProp', 2));
    });
  });

  describe('non-empty key constraint', function() {
    describe('with static validation', function() {
      it('allows a doc with a key that is not empty', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticNonEmptyKeyProp: { 'foo': 'bar' }
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty key', function() {
        var doc = {
          _id: 'hashtableDoc',
          staticNonEmptyKeyProp: { '': 'bar' }
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableKeyEmpty('staticNonEmptyKeyProp'));
      });
    });

    describe('with dynamic validation', function() {
      it('allows a doc with a key that is not empty', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicNonEmptyKeyProp: { 'foo': 'bar' },
          dynamicKeysMustNotBeEmpty: true
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('allows a doc with an empty key when the constraint is disabled', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicNonEmptyKeyProp: { '': 'bar' },
          dynamicKeysMustNotBeEmpty: false
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty key when the constraint is enabled', function() {
        var doc = {
          _id: 'hashtableDoc',
          dynamicNonEmptyKeyProp: { '': 'bar' },
          dynamicKeysMustNotBeEmpty: true
        };

        testHelper.verifyDocumentNotCreated(doc, 'hashtableDoc', errorFormatter.hashtableKeyEmpty('dynamicNonEmptyKeyProp'));
      });
    });
  });
});
