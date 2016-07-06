var testHelper = require('../etc/test-helper.js');

describe('Date/time validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-datetime-sync-function.js');
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
        [ 'item "rangeValidationAsDatetimesProp" must not be less than 2016-06-23T21:52:17.123-08:00' ]);
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24'  // Treated as UTC when time zone is undefined, making it less than the min value
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatetimesProp" must not be less than 2016-06-23T21:52:17.123-08:00' ]);
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-23T21:52:17.124-08:00'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatetimesProp" must not be greater than 2016-06-24T05:52:17.123Z' ]);
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-25'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatetimesProp" must not be greater than 2016-06-24T05:52:17.123Z' ]);
    });

    it('does not consider an invalid date/time as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatetimesProp" must be an ISO 8601 date string with optional time and time zone components' ]);
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
        [ 'item "rangeValidationAsDatesOnlyProp" must not be less than 2016-06-24' ]);
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatesOnlyProp" must not be less than 2016-06-24' ]);
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-24T00:00:00.001Z'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatesOnlyProp" must not be greater than 2016-06-24' ]);
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-25'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatesOnlyProp" must not be greater than 2016-06-24' ]);
    });

    it('does not consider an invalid date as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: 'not-a-date'
      };

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      testHelper.verifyDocumentNotCreated(
        doc,
        'datetimeDoc',
        [ 'item "rangeValidationAsDatesOnlyProp" must be an ISO 8601 date string with optional time and time zone components' ]);
    });
  });
});
