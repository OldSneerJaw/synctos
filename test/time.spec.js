var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Time validation type:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-time-sync-function.js');
  });

  describe('format', function() {
    it('accepts a valid time with all components and period as a decimal separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '23:59:59.999'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid time without the millisecond component', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '23:59:59'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts a valid time without the second and millisecond components', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '23:59'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a time without the minute, second and millisecond components', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '23'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.timeFormatInvalid('formatValidationProp'));
    });

    it('rejects a time that is above the maximum value', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '24:00:00.000'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.timeFormatInvalid('formatValidationProp'));
    });

    it('rejects a time that is formatted incorrectly', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '235959.999'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.timeFormatInvalid('formatValidationProp'));
    });

    it('rejects a time that is not a string', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: 235959.999
      };

      testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'time'));
    });

    it('rejects a time with a comma for a decimal separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '23:59:59,999'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'time'));
    });
  });

  describe('inclusive range constraints', function() {
    it('allow a time with all components that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxInclusiveValuesProp: '01:08:53.115'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a time without milliseconds that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxInclusiveValuesProp: '01:09:01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a time without seconds and milliseconds that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxInclusiveValuesProp: '01:08'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time that is less than the minimum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxInclusiveValuesProp: '01:07:59.999'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.minimumValueViolation('minAndMaxInclusiveValuesProp', '01:08:00.000'));
    });

    it('reject a time that is greater than the maximum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxInclusiveValuesProp: '01:09:01.001'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.maximumValueViolation('minAndMaxInclusiveValuesProp', '01:09:01'));
    });
  });

  describe('exclusive range constraints', function() {
    it('allow a time with all components that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:01.001'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a time without milliseconds that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:01'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time that is less than the minimum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:00.9'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42:00.999'));
    });

    it('reject a time that is equal to the minimum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:00.999'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42:00.999'));
    });

    it('reject a time that is greater than the maximum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:01.01'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42:01.002'));
    });

    it('reject a time that is equal to the maximum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:01.002'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42:01.002'));
    });
  });

  describe('intelligent equality constraint', function() {
    it('allows a time that matches the expected time exactly', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeMustEqualDocType',
        equalityValidationProp: '22:56:00.000'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a time that matches the expected time without all millisecond digits', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeMustEqualDocType',
        equalityValidationProp: '22:56:00.0'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a time that matches the expected time without any millisecond digits', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeMustEqualDocType',
        equalityValidationProp: '22:56:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a time that matches the expected time without seconds', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeMustEqualDocType',
        equalityValidationProp: '22:56'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a time that does not match the expected time', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeMustEqualDocType',
        equalityValidationProp: '22:56:00.001'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', '22:56:00.000') ]);
    });
  });

  describe('intelligent immutability constraint', function() {
    it('allows a time that exactly matches the existing time', function() {
      var oldDoc = {
        _id: 'my-doc',
        type: 'timeDoc',
        immutableValidationProp: '01:45:15.9'
      };

      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        immutableValidationProp: '01:45:15.9'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a time with omitted optional components that matches the existing time', function() {
      var oldDoc = {
        _id: 'my-doc',
        type: 'timeDoc',
        immutableValidationProp: '08:11:00.0'
      };

      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        immutableValidationProp: '08:11'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a time that does not match the existing time', function() {
      var oldDoc = {
        _id: 'my-doc',
        type: 'timeDoc',
        immutableValidationProp: '12:34:56.789'
      };

      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        immutableValidationProp: '12:34:56.78'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'timeDoc', [ errorFormatter.immutableItemViolation('immutableValidationProp') ]);
    });
  });
});
