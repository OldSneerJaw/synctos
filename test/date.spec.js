const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Date validation type:', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-date-sync-function.js');
  });

  describe('format validation', () => {
    it('accepts a valid date with all components', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date without a day', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '0000-12'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a valid date without a month or day', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '9999'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a date with an invalid year', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '999-07-17'
      };

      testFixture.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with an invalid month', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-13-17'
      };

      testFixture.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with an invalid day', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-32'
      };

      testFixture.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with time and time zone components', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17T15:01:58.382-05:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with a time but no time zone', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17T21:27:10.894'
      };

      testFixture.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a value that is not a string', () => {
      const doc = {
        _id: 'dateDoc',
        formatValidationProp: 20160717
      };

      testFixture.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'date'));
    });
  });

  describe('inclusive range constraints', () => {
    it('accepts a date with all components that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01-01'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a date without a day that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a date with a month or day that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', () => {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2015-12-31'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationProp', '2015-12-31T23:59:59.999Z'));
    });

    it('rejects a date that is greater than the maximum value', () => {
      const doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01-02'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueViolation('inclusiveRangeValidationProp', '2016-01-01T23:59:59.999Z'));
    });
  });

  describe('exclusive range constraints', () => {
    it('accepts a date with all components that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-01'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts a date without a day that is within the minimum and maximum values', () => {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', () => {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2017-12-31'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationProp', '2018'));
    });

    it('rejects a date that is equal to the minimum value', () => {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationProp', '2018'));
    });

    it('rejects a date that is greater than the maximum value', () => {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-03'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationProp', '2018-02-02'));
    });

    it('rejects a date that is equal to the maximum value', () => {
      const doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-02'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationProp', '2018-02-02'));
    });
  });

  describe('intelligent equality constraint', () => {
    it('allows a full date-only string that matches the expected date', () => {
      const doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2018-01-01'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a date-only string without day that matches the expected date', () => {
      const doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2018-01'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a date-only string without month and day that matches the expected date', () => {
      const doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2018'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a date-only string that does not match the expected date', () => {
      const doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2017-12-31'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dateMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', '2018-01-01T00:00:00.000Z') ]);
    });
  });

  describe('intelligent immutability constraint', () => {
    it('allows a date that exactly matches the existing date', () => {
      const oldDoc = {
        _id: 'dateDoc',
        immutableValidationProp: '2018-02-11'
      };

      const doc = {
        _id: 'dateDoc',
        immutableValidationProp: '2018-02-11'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a date with omitted optional components that matches the existing date', () => {
      const oldDoc = {
        _id: 'dateDoc',
        immutableValidationProp: new Date(Date.UTC(2017, 0, 1))
      };

      const doc = {
        _id: 'dateDoc',
        immutableValidationProp: '2017'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a date that does not match the existing date', () => {
      const oldDoc = {
        _id: 'dateDoc',
        immutableValidationProp: '2018-11-12'
      };

      const doc = {
        _id: 'dateDoc',
        immutableValidationProp: '2017-11-12'
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'dateDoc', [ errorFormatter.immutableItemViolation('immutableValidationProp') ]);
    });
  });
});
