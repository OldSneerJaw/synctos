var testHelper = require('../src/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Date/time validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-datetime-sync-function.js');
  });

  describe('format validation', function() {
    it('accepts a valid date/time with time and time zone components', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a time component but no time zone', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17 15:20:09.348'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a time zone component but no time', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with neither time nor time zone components', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date/time with an invalid year', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '10000-07-17T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid month', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-00-17T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid day', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-00T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid hour', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T25:20:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid minutes', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:60:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid seconds', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:60.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid milliseconds', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.1000-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid time zone hour', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-24:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid time zone minutes', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-07:60'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });
  });

  describe('range validation for min and max dates with time and time zone components', function() {
    it('can create a doc with a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24 08:22:17.123+0230'  // Same date/time as the min and max values, different time zone
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24T05:52:17.122Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('rangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24'  // Treated as UTC when time zone is undefined, making it less than the min value
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('rangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-23T21:52:17.124-08:00'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('rangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-25'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('rangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('does not consider an invalid date/time as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('rangeValidationAsDatetimesProp'));
    });
  });

  describe('range validation for min and max dates without time and time zone components', function() {
    it('can create a doc with a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23T16:30:00.000-07:30'  // When adjusted to UTC, this matches the min and max dates
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a doc with a date without time and time zone components that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-24'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23T23:59:59.999Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('rangeValidationAsDatesOnlyProp', '2016-06-24T00:00:00.000Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('rangeValidationAsDatesOnlyProp', '2016-06-24T00:00:00.000Z'));
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-24T00:00:00.001Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('rangeValidationAsDatesOnlyProp', '2016-06-24'));
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-25'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('rangeValidationAsDatesOnlyProp', '2016-06-24'));
    });

    it('does not consider an invalid date as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('rangeValidationAsDatesOnlyProp'));
    });
  });
});
