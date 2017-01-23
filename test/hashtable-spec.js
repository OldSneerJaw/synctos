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
});
