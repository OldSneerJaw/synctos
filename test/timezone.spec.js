var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Time zone validation type:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-timezone-sync-function.js');
  });

  describe('format', function() {
    it('allows the UTC time zone', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone with a colon separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone without a colon separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+1030'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a time zone without a positive or negative sign', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '1030'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone without a minute component', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is less than the minimum possible value', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-24:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is greater than the maximum possible value', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+24:00'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is not a string', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: -0800
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'timezone'));
    });
  });

  describe('inclusive range constraints', function() {
    it('allow a valid time zone with a colon separator that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '-00:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a valid time zone without a colon separator that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '+0000'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow zero/zulu time zone when it is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time zone that is less than the minimum range constraint', function() {
      var doc = {
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
      var doc = {
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
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-10:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a valid time zone without a colon separator that is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1230'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow zero/zulu time zone when it is within the minimum and maximum value range', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject a time zone that is less than the minimum range constraint', function() {
      var doc = {
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
      var doc = {
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
      var doc = {
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
      var doc = {
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

  describe('intelligent equality constraint', function() {
    it('allows a value that matches the expected value exactly', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a value that specifies UTC as positive zero', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: '+00:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a value that specifies UTC as negative zero', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: '-0000'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a value that differs from the expected value', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: '+21:45'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'timezoneMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', 'Z') ]);
    });
  });

  describe('intelligent immutability constraint', function() {
    it('allows a time zone that does not differ from the old time zone', function() {
      var oldDoc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '+09:15'
      };

      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '+09:15'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a time zone that differs from the old time zone only by omitting the colon separator', function() {
      var oldDoc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '-03:30'
      };

      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '-0330'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a time zone that differs from the old time zone', function() {
      var oldDoc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '+11:00'
      };

      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '-11:00'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'timezoneDoc', [ errorFormatter.immutableItemViolation('immutableValidationProp') ]);
    });
  });
});
