const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Range constraints:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-range-constraint-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('static inclusive ranges', () => {
    it('allow an integer that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticIntegerProp: -5
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a floating point number that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticFloatProp: 7.5
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a datetime that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.920-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a date that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticDateProp: '2016-07-19',
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject an integer that is below the minimum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticIntegerProp: -6
      };

      testFixture.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', errorFormatter.minimumValueViolation('staticIntegerProp', -5));
    });

    it('reject an integer that is above the maximum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticIntegerProp: -4
      };

      testFixture.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', errorFormatter.maximumValueViolation('staticIntegerProp', -5));
    });

    it('reject a floating point number that is below the minimum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticFloatProp: 7.499
      };

      testFixture.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', errorFormatter.minimumValueViolation('staticFloatProp', 7.5));
    });

    it('reject a floating point number that is above the maximum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticFloatProp: 7.501
      };

      testFixture.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', errorFormatter.maximumValueViolation('staticFloatProp', 7.5));
    });

    it('reject a datetime that is below the minimum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.919-07:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'inclusiveRangeDocType',
        errorFormatter.minimumValueViolation('staticDatetimeProp', '2016-07-19T19:24:38.920-07:00'));
    });

    it('reject a datetime that is above the maximum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.921-07:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'inclusiveRangeDocType',
        errorFormatter.maximumValueViolation('staticDatetimeProp', '2016-07-19T19:24:38.920-07:00'));
    });

    it('reject a date that is below the minimum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticDateProp: '2016-07-18'
      };

      testFixture.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', errorFormatter.minimumValueViolation('staticDateProp', '2016-07-19'));
    });

    it('reject a date that is above the maximum constraint', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        staticDateProp: '2016-07-20'
      };

      testFixture.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', errorFormatter.maximumValueViolation('staticDateProp', '2016-07-19'));
    });
  });

  describe('dynamic inclusive ranges', () => {
    it('allow an integer that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicIntegerProp: 95,
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a floating point number that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicFloatProp: -867.1,
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a datetime that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicDatetimeProp: '2017-04-07T18:24:38.920-07:00',
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a date that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicDateProp: '2017-04-07',
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject an integer that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicIntegerProp: 11,
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'inclusiveRangeDocType',
        [ errorFormatter.minimumValueViolation('dynamicIntegerProp', 12), errorFormatter.maximumValueViolation('dynamicIntegerProp', 10) ]);
    });

    it('reject a floating point number that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicFloatProp: 89.98,
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'inclusiveRangeDocType',
        [ errorFormatter.minimumValueViolation('dynamicFloatProp', 90.98), errorFormatter.maximumValueViolation('dynamicFloatProp', 88.98) ]);
    });

    it('reject a datetime that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicDatetimeProp: '2016-07-19T19:24:38.919-07:00',
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'inclusiveRangeDocType',
        [
          errorFormatter.minimumValueViolation('dynamicDatetimeProp', '9999-12-31'),
          errorFormatter.maximumValueViolation('dynamicDatetimeProp', '0000-01-01')
        ]);
    });

    it('reject a date that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'inclusiveRangeDocType',
        dynamicDateProp: '2016-07-18',
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'inclusiveRangeDocType',
        [
          errorFormatter.minimumValueViolation('dynamicDateProp', '9999-12-31'),
          errorFormatter.maximumValueViolation('dynamicDateProp', '0000-01-01')
        ]);
    });
  });

  describe('static exclusive ranges', () => {
    it('allow an integer that is within the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticIntegerProp: 52
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a floating point number that is within the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticFloatProp: -14
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a datetime that is within the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.920-07:00'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a date that is within the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDateProp: '2016-07-19'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject an integer that is equal to the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticIntegerProp: 51
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.minimumValueExclusiveViolation('staticIntegerProp', 51));
    });

    it('reject an integer that is less than the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticIntegerProp: 50
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.minimumValueExclusiveViolation('staticIntegerProp', 51));
    });

    it('reject an integer that is equal to the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticIntegerProp: 53
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.maximumValueExclusiveViolation('staticIntegerProp', 53));
    });

    it('reject an integer that is greater than the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticIntegerProp: 54
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.maximumValueExclusiveViolation('staticIntegerProp', 53));
    });

    it('reject a floating point number that is equal to the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticFloatProp: -14.001
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.minimumValueExclusiveViolation('staticFloatProp', -14.001));
    });

    it('reject a floating point number that is less than the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticFloatProp: -15
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.minimumValueExclusiveViolation('staticFloatProp', -14.001));
    });

    it('reject a floating point number that is equal to the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticFloatProp: -13.999
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.maximumValueExclusiveViolation('staticFloatProp', -13.999));
    });

    it('reject a floating point number that is greater than the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticFloatProp: -13
      };

      testFixture.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', errorFormatter.maximumValueExclusiveViolation('staticFloatProp', -13.999));
    });

    it('reject a datetime that is equal to the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.919-07:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.minimumValueExclusiveViolation('staticDatetimeProp', '2016-07-19T19:24:38.919-07:00'));
    });

    it('reject a datetime that is less than the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.918-07:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.minimumValueExclusiveViolation('staticDatetimeProp', '2016-07-19T19:24:38.919-07:00'));
    });

    it('reject a datetime that is equal to the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.921-07:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.maximumValueExclusiveViolation('staticDatetimeProp', '2016-07-19T19:24:38.921-07:00'));
    });

    it('reject a datetime that is greater than the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDatetimeProp: '2016-07-19T19:24:38.922-07:00'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.maximumValueExclusiveViolation('staticDatetimeProp', '2016-07-19T19:24:38.921-07:00'));
    });

    it('reject a date that is equal to the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDateProp: '2016-07-18'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.minimumValueExclusiveViolation('staticDateProp', '2016-07-18'));
    });

    it('reject a date that is less than the minimum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDateProp: '2016-07-17'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.minimumValueExclusiveViolation('staticDateProp', '2016-07-18'));
    });

    it('reject a date that is equal to the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDateProp: '2016-07-20'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.maximumValueExclusiveViolation('staticDateProp', '2016-07-20'));
    });

    it('reject a date that is greater than the maximum constraint', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        staticDateProp: '2016-07-21'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        errorFormatter.maximumValueExclusiveViolation('staticDateProp', '2016-07-20'));
    });
  });

  describe('dynamic exclusive ranges', () => {
    it('allow an integer that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicIntegerProp: 95,
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a floating point number that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicFloatProp: -867.1,
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a datetime that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicDatetimeProp: '2017-04-07T18:24:38.920-07:00',
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allow a date that matches the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicDateProp: '2017-04-07',
        dynamicPropertyValuesAllowed: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject an integer that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicIntegerProp: 11,
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        [
          errorFormatter.minimumValueExclusiveViolation('dynamicIntegerProp', 12),
          errorFormatter.maximumValueExclusiveViolation('dynamicIntegerProp', 10)
        ]);
    });

    it('reject a floating point number that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicFloatProp: 89.98,
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        [
          errorFormatter.minimumValueExclusiveViolation('dynamicFloatProp', 90.98),
          errorFormatter.maximumValueExclusiveViolation('dynamicFloatProp', 88.98)
        ]);
    });

    it('reject a datetime that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicDatetimeProp: '2016-07-19T19:24:38.919-07:00',
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        [
          errorFormatter.minimumValueExclusiveViolation('dynamicDatetimeProp', '9999-12-31'),
          errorFormatter.maximumValueExclusiveViolation('dynamicDatetimeProp', '0000-01-01')
        ]);
    });

    it('reject a date that is outside the minimum and maximum constraints', () => {
      const doc = {
        _id: 'exclusiveRangeDocType',
        dynamicDateProp: '2016-07-18',
        dynamicPropertyValuesAllowed: false
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'exclusiveRangeDocType',
        [
          errorFormatter.minimumValueExclusiveViolation('dynamicDateProp', '9999-12-31'),
          errorFormatter.maximumValueExclusiveViolation('dynamicDateProp', '0000-01-01')
        ]);
    });
  });
});
