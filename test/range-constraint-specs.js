var testHelper = require('../etc/test-helper.js');

describe('Range constraints:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-range-constraint-sync-function.js');
  });

  describe('inclusive ranges', function() {
    it('allow an integer that matches the minimum and maximum constraints', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        integerProp: -5
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a floating point number that matches the minimum and maximum constraints', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        floatProp: 7.5
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a datetime that matches the minimum and maximum constraints', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.920-0700'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a date that matches the minimum and maximum constraints', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        dateProp: '2016-07-19'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject an integer that is below the minimum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        integerProp: -6
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "integerProp" must not be less than -5');
    });

    it('reject an integer that is above the maximum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        integerProp: -4
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "integerProp" must not be greater than -5');
    });

    it('reject a floating point number that is below the minimum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        floatProp: 7.499
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "floatProp" must not be less than 7.5');
    });

    it('reject a floating point number that is above the maximum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        floatProp: 7.501
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "floatProp" must not be greater than 7.5');
    });

    it('reject a datetime that is below the minimum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.919-0700'
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "datetimeProp" must not be less than 2016-07-19T19:24:38.920-0700');
    });

    it('reject a datetime that is above the maximum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.921-0700'
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "datetimeProp" must not be greater than 2016-07-19T19:24:38.920-0700');
    });

    it('reject a date that is below the minimum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        dateProp: '2016-07-18'
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "dateProp" must not be less than 2016-07-19');
    });

    it('reject a date that is above the maximum constraint', function() {
      var doc = {
        _id: 'inclusiveRangeDocType',
        dateProp: '2016-07-20'
      };

      testHelper.verifyDocumentNotCreated(doc, 'inclusiveRangeDocType', 'item "dateProp" must not be greater than 2016-07-19');
    });
  });

  describe('exclusive ranges', function() {
    it('allow an integer that is within the minimum and maximum constraints', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        integerProp: 52
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a floating point number that is within the minimum and maximum constraints', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        floatProp: -14
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a datetime that is within the minimum and maximum constraints', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.920-0700'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allow a date that is within the minimum and maximum constraints', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        dateProp: '2016-07-19'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('reject an integer that is equal to the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        integerProp: 51
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "integerProp" must not be less than or equal to 51');
    });

    it('reject an integer that is less than the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        integerProp: 50
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "integerProp" must not be less than or equal to 51');
    });

    it('reject an integer that is equal to the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        integerProp: 53
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "integerProp" must not be greater than or equal to 53');
    });

    it('reject an integer that is greater than the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        integerProp: 54
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "integerProp" must not be greater than or equal to 53');
    });

    it('reject a floating point number that is equal to the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        floatProp: -14.001
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "floatProp" must not be less than or equal to -14.001');
    });

    it('reject a floating point number that is less than the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        floatProp: -15
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "floatProp" must not be less than or equal to -14.001');
    });

    it('reject a floating point number that is equal to the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        floatProp: -13.999
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "floatProp" must not be greater than or equal to -13.999');
    });

    it('reject a floating point number that is greater than the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        floatProp: -13
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "floatProp" must not be greater than or equal to -13.999');
    });

    it('reject a datetime that is equal to the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.919-0700'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "datetimeProp" must not be less than or equal to 2016-07-19T19:24:38.919-0700');
    });

    it('reject a datetime that is less than the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.918-0700'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "datetimeProp" must not be less than or equal to 2016-07-19T19:24:38.919-0700');
    });

    it('reject a datetime that is equal to the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.921-0700'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "datetimeProp" must not be greater than or equal to 2016-07-19T19:24:38.921-0700');
    });

    it('reject a datetime that is greater than the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        datetimeProp: '2016-07-19T19:24:38.922-0700'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "datetimeProp" must not be greater than or equal to 2016-07-19T19:24:38.921-0700');
    });

    it('reject a date that is equal to the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        dateProp: '2016-07-18'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "dateProp" must not be less than or equal to 2016-07-18');
    });

    it('reject a date that is less than the minimum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        dateProp: '2016-07-17'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "dateProp" must not be less than or equal to 2016-07-18');
    });

    it('reject a date that is equal to the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        dateProp: '2016-07-20'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "dateProp" must not be greater than or equal to 2016-07-20');
    });

    it('reject a date that is greater than the maximum constraint', function() {
      var doc = {
        _id: 'exclusiveRangeDocType',
        dateProp: '2016-07-21'
      };

      testHelper.verifyDocumentNotCreated(doc, 'exclusiveRangeDocType', 'item "dateProp" must not be greater than or equal to 2016-07-20');
    });
  });
});
