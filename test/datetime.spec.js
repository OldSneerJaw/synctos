const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Date/time validation type', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-datetime-sync-function.js');
  });

  describe('format validation', () => {
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
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', () => {
      const doc = {
        _id: 'datetimeDoc',
        inclusiveRangeValidationAsDatetimesProp: '2016-06-24'  // Treated as midnight UTC when time component is missing, making it less than the min value
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationAsDatetimesProp', '2016-06-24T05:52:17.123Z'));
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

      console.log('exclusiveRangeValidationAsDatetimesProp: ' + doc.exclusiveRangeValidationAsDatetimesProp);

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
});
