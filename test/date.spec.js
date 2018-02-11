const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Date validation type:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-date-sync-function.js');
  });

  describe('format validation', function() {
    it('accepts a valid date with all components', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date without a day', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '0000-12'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date without a month or day', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '9999'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date with an invalid year', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '999-07-17'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with an invalid month', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-13-17'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with an invalid day', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-32'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with time and time zone components', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17T15:01:58.382-05:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with a time but no time zone', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17T21:27:10.894'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a value that is not a string', function() {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: 20160717
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'date'));
    });
  });

  describe('inclusive range constraints', function() {
    it('accepts a date with all components that is within the minimum and maximum values', function() {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a date without a day that is within the minimum and maximum values', function() {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a date with a month or day that is within the minimum and maximum values', function() {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', function() {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2015-12-31'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationProp', '2015-12-31T23:59:59.999Z'));
    });

    it('rejects a date that is greater than the maximum value', function() {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01-02'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationProp', '2016-01-01T23:59:59.999Z'));
    });
  });

  describe('exclusive range constraints', function() {
    it('accepts a date with all components that is within the minimum and maximum values', function() {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a date without a day that is within the minimum and maximum values', function() {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', function() {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2017-12-31'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationProp', '2018'));
    });

    it('rejects a date that is equal to the minimum value', function() {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationProp', '2018'));
    });

    it('rejects a date that is greater than the maximum value', function() {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-03'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationProp', '2018-02-02'));
    });

    it('rejects a date that is equal to the maximum value', function() {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-02'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationProp', '2018-02-02'));
    });
  });
});
