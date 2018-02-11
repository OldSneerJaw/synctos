const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Time zone validation type:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-timezone-sync-function.js');
  });

  describe('format', function() {
    it('allows the UTC time zone', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone with a colon separator', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone without a colon separator', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+1030'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a time zone without a positive or negative sign', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '1030'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone without a minute component', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is less than the minimum possible value', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-24:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is greater than the maximum possible value', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+24:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is not a string', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: -0800
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'timezone'));
    });
  });

  describe('inclusive range constraints', function() {
    it('allow a valid time zone with a colon separator that is within the minimum and maximum value range', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '-00:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a valid time zone without a colon separator that is within the minimum and maximum value range', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '+0000'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow zero/zulu time zone when it is within the minimum and maximum value range', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time zone that is less than the minimum range constraint', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '-0001'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.minimumValueViolation('minAndMaxInclusiveValuesProp', 'Z'));
    });

    it('reject a time zone that is greater than the maximum range constraint', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '+00:01'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.maximumValueViolation('minAndMaxInclusiveValuesProp', '+00:00'));
    });
  });

  describe('exclusive range constraints', function() {
    it('allow a valid time zone with a colon separator that is within the minimum and maximum value range', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-10:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a valid time zone without a colon separator that is within the minimum and maximum value range', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1230'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow zero/zulu time zone when it is within the minimum and maximum value range', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time zone that is less than the minimum range constraint', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-12:00'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '-1131'));
    });

    it('reject a time zone that is equal to the minimum range constraint', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-11:31'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '-1131'));
    });

    it('reject a time zone that is greater than the maximum range constraint', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1315'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '+12:31'));
    });

    it('reject a time zone that is equal to the maximum range constraint', function() {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1231'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '+12:31'));
    });
  });
});
