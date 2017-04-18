var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Date validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-date-sync-function.js');
  });

  describe('format validation', function() {
    it('accepts a valid date', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date with an invalid year', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '999-07-17'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with an invalid month', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-13-17'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with an invalid day', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-32'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('accepts a date that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-23'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-22'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueViolation('rangeValidationProp', '2016-06-23'));
    });

    it('rejects a date that is greater than the maximum value', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-24'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueViolation('rangeValidationProp', '2016-06-23T23:59:59.999Z'));
    });
  });
});
