var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Date validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-date-sync-function.js');
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
  });
});
