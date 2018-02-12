var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Date validation type:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-date-sync-function.js');
  });

  describe('format validation', function() {
    it('accepts a valid date with all components', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date without a day', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '0000-12'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid date without a month or day', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '9999'
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

    it('rejects a date with time and time zone components', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17T15:01:58.382-05:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a date with a time but no time zone', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: '2016-07-17T21:27:10.894'
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.dateFormatInvalid('formatValidationProp'));
    });

    it('rejects a value that is not a string', function() {
      var doc = {
        _id: 'dateDoc',
        formatValidationProp: 20160717
      };

      testHelper.verifyDocumentNotCreated(doc, 'dateDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'date'));
    });
  });

  describe('inclusive range constraints', function() {
    it('accepts a date with all components that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a date without a day that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a date with a month or day that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2016'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', function() {
      var doc = {
        _id: 'dateDoc',
        inclusiveRangeValidationProp: '2015-12-31'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueViolation('inclusiveRangeValidationProp', '2015-12-31T23:59:59.999Z'));
    });

    it('rejects a date that is greater than the maximum value', function() {
      var doc = {
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
      var doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a date without a day that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date that is less than the minimum value', function() {
      var doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2017-12-31'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationProp', '2018'));
    });

    it('rejects a date that is equal to the minimum value', function() {
      var doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.minimumValueExclusiveViolation('exclusiveRangeValidationProp', '2018'));
    });

    it('rejects a date that is greater than the maximum value', function() {
      var doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-03'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationProp', '2018-02-02'));
    });

    it('rejects a date that is equal to the maximum value', function() {
      var doc = {
        _id: 'dateDoc',
        exclusiveRangeValidationProp: '2018-02-02'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateDoc',
        errorFormatter.maximumValueExclusiveViolation('exclusiveRangeValidationProp', '2018-02-02'));
    });
  });

  describe('intelligent equality constraint', function() {
    it('allows a full date-only string that matches the expected date', function() {
      var doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2018-01-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a date-only string without day that matches the expected date', function() {
      var doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2018-01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a date-only string without month and day that matches the expected date', function() {
      var doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2018'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a date-only string that does not match the expected date', function() {
      var doc = {
        _id: 'dateMustEqualDoc',
        equalityValidationProp: '2017-12-31'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dateMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', '2018-01-01T00:00:00.000Z') ]);
    });
  });

  describe('intelligent immutability constraint', function() {
    it('allows a date that exactly matches the existing date', function() {
      var oldDoc = {
        _id: 'dateDoc',
        immutableValidationProp: '2018-02-11'
      };

      var doc = {
        _id: 'dateDoc',
        immutableValidationProp: '2018-02-11'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a date with omitted optional components that matches the existing date', function() {
      var oldDoc = {
        _id: 'dateDoc',
        immutableValidationProp: new Date(Date.UTC(2017, 0, 1))
      };

      var doc = {
        _id: 'dateDoc',
        immutableValidationProp: '2017'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a date that does not match the existing date', function() {
      var oldDoc = {
        _id: 'dateDoc',
        immutableValidationProp: '2018-11-12'
      };

      var doc = {
        _id: 'dateDoc',
        immutableValidationProp: '2017-11-12'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'dateDoc', [ errorFormatter.immutableItemViolation('immutableValidationProp') ]);
    });
  });
});
