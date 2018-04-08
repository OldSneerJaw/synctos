const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Date/time validation type', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-datetime-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('simple format validation', () => {
    it('accepts a valid date/time with time and time zone components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a time component but no time zone', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with neither time nor time zone components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without a day', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without month and day', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with only a year', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without milliseconds', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time without seconds and milliseconds', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a leap day for a year that is a multiple of four', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '0008-02-29T05:10+05:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a leap day for a year that is a multiple of 400', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '0400-02-29T21:21+01:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a leap day for year 0 (1 BCE)', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '0000-02-29T00:00:00.328Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a date/time with midnight specified as hour zero', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2018-04-03T00:00:00.000Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a date/time with midnight specified as hour 24', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2018-04-02T24:00:00+0300'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a date/time with a time that is one millisecond over the maximum', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2018-04-02T24:00:00.001+0300'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a time that is one second over the maximum', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2018-04-02T24:00:01.000+0300'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a time that is one minute over the maximum', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2018-04-02T24:01:00.000+0300'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid year', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '10000-07-17T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid month', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-00-17T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid day', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-00T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a leap day for a year that is not a multiple of four', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '1337-02-29T00:31:38.9-02:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a leap day for a year that is a multiple of 100 but not 400', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '0100-02-29T16:57-01:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid hour', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T25:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid minutes', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:60:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid seconds', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:60.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid milliseconds', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.1000-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with an invalid time zone hour', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-24:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with invalid time zone minutes', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-07:60'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a comma as the separator between seconds and milliseconds', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09,348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a time zone of lowercase "z"', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-06-24T08:22:17.123z'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time without minutes in the time zone component', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15:20:09.348-07'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time where a blank space is used to separate date and time components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17 15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a time zone component but no time', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17TZ'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time without minutes', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '2016-07-17T15-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time without a date component', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: 'T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a positive signed year', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+2016-07-17T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date/time with a negative signed year', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-2016-07-17T15:20:09.348-07:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a value that is not a string', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: 1522691916336
      };

      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'datetime'));
    });
  });

  describe('extended year format validation', () => {
    it('accepts a valid date/time with a positive year and all components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+001483-08-28T11:03:29.573-04:30'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a negative year and all components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-110283-12-04T22:43:17.8Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a positive year and time component but no time zone', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+010031-04-30T17:32:57.34'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a negative year and time component but no time zone', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-207754-01-18T07:07'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a positive year but neither time nor time zone components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+287396-12-31'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date/time with a negative year but neither time nor time zone components', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-283457-01-01'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a leap day with a positive year that is a multiple of 4', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+009380-02-29T14:45+0830'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a leap day with a negative year that is a multiple of 4', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-135016-02-29T11:21:05-10:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a leap day for a positive year that is not a multiple of four', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+119322-02-29'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a leap day for a negative year that is not a multiple of four', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-000009-02-29'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a positive year with too many digits', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+0123456-12-16T01:35+14:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a negative year with too many digits', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-0123456-03-23T06:22:15Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a positive year with too few digits', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+12345-11-09T12:59:42.3'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a negative year with too few digits', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-12345-03-31'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with a positive year that is too large', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '+287397-01-01T00:00Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with a negative year that is too small', () => {
      const doc = {
        _id: 'datetimeDoc',
        formatValidationProp: '-283458-12-31T23:59:59.999Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.datetimeFormatInvalid('formatValidationProp'));
    });
  });

  describe('inclusive range validation for min and max dates with time and time zone components', () => {
    it('can create a doc with a date/time that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24T08:22:17.123+0230'  // Same date/time as the min and max values, different time zone
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date/time that is less than the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24T05:52:17.122Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatetimesProp', '+002016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24'  // Treated as midnight UTC when time component is missing, making it less than the min value
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatetimesProp', '+002016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-23T21:52:17.124-08:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-25'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('does not consider an invalid date/time as out of range', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('inclusiveRangeValidationAsDatetimesProp'));
    });
  });

  describe('inclusive range validation for min and max dates without time and time zone components', () => {
    it('can create a doc with a date/time that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-23T16:30:00.000-07:30'  // When adjusted to UTC, this matches the min and max dates
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('can create a doc with a date without time and time zone components that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-24'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('cannot create a doc with a date/time that is less than the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-23T23:59:59.999Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24T00:00:00.000Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-23'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24T00:00:00.000Z'));
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-24T00:00:00.001Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24'));
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: '2016-06-25'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationAsDatesOnlyProp', '2016-06-24'));
    });

    it('does not consider an invalid date as out of range', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatesOnlyProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testFixture.verifyDocumentNotCreated(doc, 'datetimeDoc', errorFormatter.datetimeFormatInvalid('inclusiveRangeValidationAsDatesOnlyProp'));
    });
  });

  describe('exclusive range validation', () => {
    it('allows a date/time that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: new Date('2018-02-08T12:22:38-05:00').toISOString() // Output as UTC
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a date/time that is less than the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: '2018-02-07'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:37.9-0500'));
    });

    it('rejects a date/time that is equal to the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: new Date('2018-02-08T12:22:37.900-0500').toISOString() // Output as UTC
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:37.9-0500'));
    });

    it('rejects a date/time that is greater than the maximum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: '2018-02-08T19:35-11:30'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:38.1-05:00'));
    });

    it('rejects a date/time that is equal to the maximum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        exclusiveRangeValidationAsDatetimesProp: new Date('2018-02-08T12:22:38.10-0500').toISOString() // Output as UTC
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationAsDatetimesProp', '2018-02-08T12:22:38.1-05:00'));
    });
  });

  describe('dynamic range validation', () => {
    it('allows a datetime that matches expected datetimes that fall on different days because they have different time zones', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '0900-06-09T19:30Z',
        expectedMinimumValue: '+000900-06-10T01:30:00+06:00',
        expectedMaximumValue: '0900-06-08T22:00:00.000-21:30',
        expectedEqualityValue: '0900-06-10T19:29:00.0+2359'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a datetime that exceeds a maximum datetime that falls on a different day because it has a different time zone', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '+000900-06-08T22:00:00.001-21:30',
        expectedMinimumValue: '0900-06-10T01:30:00+06:00',
        expectedMaximumValue: '0900-06-09T19:30Z',
        expectedEqualityValue: '0900-06-09T15:00:00.001-04:30'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDatetimeDocType',
        [ errorFormatter.maximumValueViolation('dynamicRangeValidationProp', '0900-06-09T19:30Z') ]);
    });

    it('rejects a datetime that precedes a minimum datetime that falls on a different day because it has a different time zone', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '0900-06-10T01:29:59+06:00',
        expectedMinimumValue: '+000900-06-09T19:30Z',
        expectedMaximumValue: '0900-06-08T22:00:00.000-21:30',
        expectedEqualityValue: '0900-06-08T21:59:59.000-21:30'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDatetimeDocType',
        [ errorFormatter.minimumValueViolation('dynamicRangeValidationProp', '+000900-06-09T19:30Z') ]);
    });

    it('allows a datetime that matches expected datetimes that fall on different months because they have different time zones', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '-001337-08-31T22:15:00.000-0800',
        expectedMinimumValue: '-001337-09-01T06:15:00Z',
        expectedMaximumValue: '-001337-09-02T00:45+1830',
        expectedEqualityValue: '-001337-08-31T12:45:00.000-17:30'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a datetime that exceeds a maximum datetime that falls on a different month because it has a different time zone', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '1600-03-01T00:46+1830',
        expectedMinimumValue: '1600-02-29T06:15:00Z',
        expectedMaximumValue: '1600-02-28T22:15:00.000-0800',
        expectedEqualityValue: '1600-02-28T22:16:00.000-0800'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDatetimeDocType',
        [ errorFormatter.maximumValueViolation('dynamicRangeValidationProp', '1600-02-28T22:15:00.000-0800') ]);
    });

    it('rejects a datetime that precedes a minimum datetime that falls on a different month because it has a different time zone', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '-001337-09-01T06:14:59.999+08:00',
        expectedMinimumValue: '-001337-08-30T23:45-22:30',
        expectedMaximumValue: '-001337-08-31T22:15:00.000Z',
        expectedEqualityValue: '-001337-08-30T23:44:59.999-22:30'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDatetimeDocType',
        [ errorFormatter.minimumValueViolation('dynamicRangeValidationProp', '-001337-08-30T23:45-22:30') ]);
    });

    it('allows a datetime that matches expected datetimes that fall on different years because they have different time zones', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '3248-01-01T09:45:32.000+16:45',
        expectedMinimumValue: '3247-12-30T23:30:32-17:30',
        expectedMaximumValue: '3247-12-31T17:00:32.0Z',
        expectedEqualityValue: '3247-12-30T23:30:32-17:30'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a datetime that exceeds a maximum datetime that falls on a different year because it has a different time zone', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '1900-01-01T12:01Z',
        expectedMinimumValue: '1900-01-02T04:00:00.000+16:00',
        expectedMaximumValue: '1899-12-31T15:15:00-20:45',
        expectedEqualityValue: '1899-12-31T15:16:00-20:45'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDatetimeDocType',
        [ errorFormatter.maximumValueViolation('dynamicRangeValidationProp', '1899-12-31T15:15:00-20:45') ]);
    });

    it('rejects a datetime that precedes a minimum datetime that falls on a different year because it has a different time zone', () => {
      const doc = {
        _id: 'dynamicDatetimeDocType',
        dynamicRangeValidationProp: '9999-12-31T22:59:59.9-1445',
        expectedMinimumValue: '+010000-01-01T13:45Z',
        expectedMaximumValue: '9999-12-31T24:00:00.0-13:45',
        expectedEqualityValue: '+010000-01-01T13:44:59.900Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDatetimeDocType',
        [ errorFormatter.minimumValueViolation('dynamicRangeValidationProp', '+010000-01-01T13:45Z') ]);
    });
  });

  describe('intelligent equality constraint', () => {
    it('allows a datetime that exactly matches the expected datetime', () => {
      const doc = {
        _id: 'datetimeMustEqualDoc',
        equalityValidationProp: '2018-01-01T11:00:00.000+09:30'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a datetime with a different time zone and without optional components that matches the expected datetime', () => {
      const doc = {
        _id: 'datetimeMustEqualDoc',
        equalityValidationProp: '2018T01:30Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a datetime that does not match the expected datetime', () => {
      const doc = {
        _id: 'datetimeMustEqualDoc',
        equalityValidationProp: '2018-01-01T01:30:00.001Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', '2018-01-01T11:00:00.000+09:30') ]);
    });
  });

  describe('intelligent immutability constraint', () => {
    it('allows a datetime that exactly matches the existing datetime', () => {
      const oldDoc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '2018-02-11T19:40:13.822-08:00'
      };

      const doc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '2018-02-11T19:40:13.822-08:00'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a datetime with omitted optional components that matches the existing datetime', () => {
      const oldDoc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '2018-02-01' // No time component means midnight UTC
      };

      const doc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '2018-02T13:40+13:40'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a datetime where midnight specified as hour zero is equal to midnight specified as hour 24 of the preceding day', () => {
      const oldDoc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '1984-03-01T24:00-01:00'
      };

      const doc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '1984-03-02T00:00:00-01:00'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a datetime that does not match the existing datetime', () => {
      const oldDoc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '1999-12-31T23:59:59.999-0800'
      };

      const doc = {
        _id: 'datetimeDoc',
        immutabilityValidationProp: '1999-12-31T23:59:59.999-0700'
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'datetimeDoc',
        [ errorFormatter.immutableItemViolation('immutabilityValidationProp') ]);
    });
  });

  describe('interpretation of years between 0 and 99', () => {
    it('does not treat year 1900 as less than or equal to year 99', () => {
      const doc = {
        _id: 'datetimeDoc',
        twoDigitYearValidationProp: '1900-04-09T08:38:29Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ errorFormatter.maximumValueViolation('twoDigitYearValidationProp', '0099-12-31T23:59:59.999+12:00')]);
    });

    it('does not treat year 1999 as less than or equal to year 99', () => {
      const doc = {
        _id: 'datetimeDoc',
        twoDigitYearValidationProp: '1999-06-01T15:44Z'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ errorFormatter.maximumValueViolation('twoDigitYearValidationProp', '0099-12-31T23:59:59.999+12:00')]);
    });
  });
});
