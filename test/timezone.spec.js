const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Time zone validation type:', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-timezone-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('format', () => {
    it('allows the UTC time zone', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: 'Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone with a colon separator', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone without a colon separator', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+1030'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a time zone without a positive or negative sign', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '1030'
      };

      testFixture.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone without a minute component', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08'
      };

      testFixture.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is less than the minimum possible value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-24:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is greater than the maximum possible value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+24:00'
      };

      testFixture.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is not a string', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: -0800
      };

      testFixture.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'timezone'));
    });
  });

  describe('inclusive range constraints', () => {
    it('allow a valid time zone with a colon separator that is within the minimum and maximum value range', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '-00:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a valid time zone without a colon separator that is within the minimum and maximum value range', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '+0000'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow zero/zulu time zone when it is within the minimum and maximum value range', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: 'Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject a time zone that is less than the minimum range constraint', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '-0001'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.minimumValueViolation('minAndMaxInclusiveValuesProp', 'Z'));
    });

    it('reject a time zone that is greater than the maximum range constraint', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxInclusiveValuesProp: '+00:01'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.maximumValueViolation('minAndMaxInclusiveValuesProp', '+00:00'));
    });
  });

  describe('exclusive range constraints', () => {
    it('allow a valid time zone with a colon separator that is within the minimum and maximum value range', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-10:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a valid time zone without a colon separator that is within the minimum and maximum value range', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1230'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow zero/zulu time zone when it is within the minimum and maximum value range', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: 'Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject a time zone that is less than the minimum range constraint', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-12:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '-1131'));
    });

    it('reject a time zone that is equal to the minimum range constraint', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '-11:31'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.minimumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '-1131'));
    });

    it('reject a time zone that is greater than the maximum range constraint', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1315'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '+12:31'));
    });

    it('reject a time zone that is equal to the maximum range constraint', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        minAndMaxExclusiveValuesProp: '+1231'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneDoc',
        errorFormatter.maximumValueExclusiveViolation('minAndMaxExclusiveValuesProp', '+12:31'));
    });
  });

  describe('intelligent equality constraint', () => {
    it('allows a value that matches the expected value exactly', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: 'Z'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a value that specifies UTC as positive zero', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: '+00:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a value that specifies UTC as negative zero', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: '-0000'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a value that differs from the expected value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'timezoneMustEqualDocType',
        equalityValidationProp: '+21:45'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'timezoneMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', 'Z') ]);
    });
  });

  describe('intelligent immutability constraint', () => {
    it('allows a time zone that does not differ from the old time zone', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '+09:15'
      };

      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '+09:15'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a time zone that differs from the old time zone only by omitting the colon separator', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '-03:30'
      };

      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '-0330'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a time zone that differs from the old time zone', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '+11:00'
      };

      const doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        immutableValidationProp: '-11:00'
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'timezoneDoc', [ errorFormatter.immutableItemViolation('immutableValidationProp') ]);
    });
  });
});
