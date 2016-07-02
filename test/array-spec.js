var testHelper = require('../etc/test-helper.js');

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

      testHelper.verifyDocumentNotCreated(doc, undefined, 'arrayDoc', [ 'length of item "lengthValidationProp" must not be less than 2' ]);
    });

    it('cannot create a doc with an array that is longer than the maximum length', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo', 'bar', 'baz' ]
      };

      testHelper.verifyDocumentNotCreated(doc, undefined, 'arrayDoc', [ 'length of item "lengthValidationProp" must not be greater than 2' ]);
    });
  });
});
