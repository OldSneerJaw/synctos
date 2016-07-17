var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Date validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-date-sync-function.js');
  });

  describe('range validation', function() {
    it('can create a doc with a date that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-23'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date that is before the minimum value', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-22'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.minimumValueViolation('rangeValidationProp', '2016-06-23'));
    });

    it('cannot create a doc with a date that is after than the maximum value', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-24'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.maximumValueViolation('rangeValidationProp', '2016-06-23'));
    });
  });
});
