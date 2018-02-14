var testHelper = require('../src/testing/test-helper.js');
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
        formatValidationProp: '2016-07-17T15:20:09.348'
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

    it('accepts a valid date/time without a day', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without month and day', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with only a year', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without milliseconds', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09-07:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without seconds and milliseconds', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20-07:00'
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

    it('rejects a date/time with a comma as the separator between seconds and milliseconds', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09,348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a time zone of lowercase "z"', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-06-24T08:22:17.123z'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time without minutes in the time zone component', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-07'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time where a blank space is used to separate date and time components', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17 15:20:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a time zone component but no time', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17TZ'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time without minutes', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time without a date component', function() {
      var doc = {
        _id: 'datetimeDoc',
        formatValidationProp: 'T15:20:09.348-07:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });
  });

  describe('inclusive range validation for min and max dates with time and time zone components', function() {
    it('can create a doc with a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24T08:22:17.123+0230'  // Same date/time as the min and max values, different time zone
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24T05:52:17.122Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24'  // Treated as midnight UTC when time component is missing, making it less than the min value
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-23T21:52:17.124-08:00'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-25'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('does not consider an invalid date/time as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('inclusiveRangeValidationAsDatetimesProp'));
    });
  });

  describe('inclusive range validation for min and max dates without time and time zone components', function() {
    it('can create a doc with a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-23T16:30:00.000-07:30'  // When adjusted to UTC, this matches the min and max dates
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a doc with a date without time and time zone components that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-24'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-23T23:59:59.999Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24T00:00:00.000Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-23'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24T00:00:00.000Z'));
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-24T00:00:00.001Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24'));
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-25'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24'));
    });

    it('does not consider an invalid date as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testHelper.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('inclusiveRangeValidationAsDatesOnlyProp'));
    });
  });

  describe('exclusive range validation', function() {
    it('allows a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: new Date('2018-02-08T12:22:38').toISOString() // Output as UTC
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: '2018-02-07'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:37.9'));
    });

    it('rejects a date/time that is equal to the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: new Date('2018-02-08T12:22:37.900').toISOString() // Output as UTC
      };

      console.log('exclusiveRangeValidationAsDatetimesProp: ' + doc.exclusiveRangeValidationAsDatetimesProp);

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:37.9'));
    });

    it('rejects a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: '2018-02-08T19:35'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:38.1'));
    });

    it('rejects a date/time that is equal to the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: new Date('2018-02-08T12:22:38.10').toISOString() // Output as UTC
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:38.1'));
    });
  });

  describe('intelligent equality constraint', function() {
    it('allows a datetime that exactly matches the expected datetime', function() {
      var doc = {
        _id: 'datetimeMustEqualDoc',
        equalityValidationProp: '2018-01-01T11:00:00.000+09:30'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a datetime with a different time zone and without optional components that matches the expected datetime', function() {
      var doc = {
        _id: 'datetimeMustEqualDoc',
        equalityValidationProp: '2018T01:30Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a datetime that does not match the expected datetime', function() {
      var doc = {
        _id: 'datetimeMustEqualDoc',
        equalityValidationProp: '2018-01-01T01:30:00.001Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', '2018-01-01T11:00:00.000+09:30') ]);
    });
  });
});
