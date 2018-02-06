var testHelper = require('../src/test-helper.js');
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

    it('accepts a valid time with all components and comma as a decimal separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        formatValidationProp: '00:00:00,000'
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
    it('allow a time that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:00.001'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time that is less than the minimum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:41:59.999'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42'));
    });

    it('reject a time that is equal to the minimum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:00'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42'));
    });

    it('reject a time that is greater than the maximum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:00.003'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42:00.002'));
    });

    it('reject a time that is equal to the maximum value constraint', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timeDoc',
        minAndMaxExclusiveValuesProp: '13:42:00.002'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timeDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '13:42:00.002'));
    });
  });
});