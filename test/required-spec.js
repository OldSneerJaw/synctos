var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Required value constraint', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-required-sync-function.js');
  });

  describe('with static validation', function() {
    it('allows a doc with values that are neither null nor undefined', function() {
      var doc = {
        _id: 'staticDoc',
        stringProp: '',
        integerProp: 0,
        floatProp: 0.0,
        booleanProp: false,
        datetimeProp: '1970-01-01T00:00:00.000Z',
        dateProp: '1970-01-01',
        enumProp: 0,
        attachmentReferenceProp: '',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('blocks a doc with values that are null', function() {
      var doc = {
        _id: 'staticDoc',
        stringProp: null,
        integerProp: null,
        floatProp: null,
        booleanProp: null,
        datetimeProp: null,
        dateProp: null,
        enumProp: null,
        attachmentReferenceProp: null,
        arrayProp: null,
        objectProp: null,
        hashtableProp: null,
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticDoc',
        [
          errorFormatter.requiredValueViolation('hashtableProp'),
          errorFormatter.requiredValueViolation('objectProp'),
          errorFormatter.requiredValueViolation('arrayProp'),
          errorFormatter.requiredValueViolation('attachmentReferenceProp'),
          errorFormatter.requiredValueViolation('enumProp'),
          errorFormatter.requiredValueViolation('dateProp'),
          errorFormatter.requiredValueViolation('datetimeProp'),
          errorFormatter.requiredValueViolation('booleanProp'),
          errorFormatter.requiredValueViolation('floatProp'),
          errorFormatter.requiredValueViolation('integerProp'),
          errorFormatter.requiredValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with values that are undefined', function() {
      var doc = {
        _id: 'staticDoc',
        stringProp: undefined,
        integerProp: undefined,
        floatProp: undefined,
        booleanProp: undefined,
        datetimeProp: undefined,
        dateProp: undefined,
        enumProp: undefined,
        attachmentReferenceProp: undefined,
        arrayProp: undefined,
        objectProp: undefined,
        hashtableProp: undefined,
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticDoc',
        [
          errorFormatter.requiredValueViolation('hashtableProp'),
          errorFormatter.requiredValueViolation('objectProp'),
          errorFormatter.requiredValueViolation('arrayProp'),
          errorFormatter.requiredValueViolation('attachmentReferenceProp'),
          errorFormatter.requiredValueViolation('enumProp'),
          errorFormatter.requiredValueViolation('dateProp'),
          errorFormatter.requiredValueViolation('datetimeProp'),
          errorFormatter.requiredValueViolation('booleanProp'),
          errorFormatter.requiredValueViolation('floatProp'),
          errorFormatter.requiredValueViolation('integerProp'),
          errorFormatter.requiredValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with values that are missing', function() {
      var doc = { _id: 'staticDoc' };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticDoc',
        [
          errorFormatter.requiredValueViolation('hashtableProp'),
          errorFormatter.requiredValueViolation('objectProp'),
          errorFormatter.requiredValueViolation('arrayProp'),
          errorFormatter.requiredValueViolation('attachmentReferenceProp'),
          errorFormatter.requiredValueViolation('enumProp'),
          errorFormatter.requiredValueViolation('dateProp'),
          errorFormatter.requiredValueViolation('datetimeProp'),
          errorFormatter.requiredValueViolation('booleanProp'),
          errorFormatter.requiredValueViolation('floatProp'),
          errorFormatter.requiredValueViolation('integerProp'),
          errorFormatter.requiredValueViolation('stringProp')
        ]);
    });
  });

  describe('with dynamic validation', function() {
    it('allows a doc with values that are neither null nor undefined', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: '',
        integerProp: 0,
        floatProp: 0.0,
        booleanProp: false,
        datetimeProp: '1970-01-01T00:00:00.000Z',
        dateProp: '1970-01-01',
        enumProp: 0,
        attachmentReferenceProp: '',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a doc with values that are either null or undefined if enforcement is disabled', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: false,
        stringProp: null,
        integerProp: undefined,
        floatProp: null,
        booleanProp: undefined,
        datetimeProp: null,
        dateProp: undefined,
        enumProp: null,
        attachmentReferenceProp: undefined,
        arrayProp: null,
        objectProp: undefined,
        hashtableProp: null
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('blocks a doc with values that are null', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: null,
        integerProp: null,
        floatProp: null,
        booleanProp: null,
        datetimeProp: null,
        dateProp: null,
        enumProp: null,
        attachmentReferenceProp: null,
        arrayProp: null,
        objectProp: null,
        hashtableProp: null,
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicDoc',
        [
          errorFormatter.requiredValueViolation('hashtableProp'),
          errorFormatter.requiredValueViolation('objectProp'),
          errorFormatter.requiredValueViolation('arrayProp'),
          errorFormatter.requiredValueViolation('attachmentReferenceProp'),
          errorFormatter.requiredValueViolation('enumProp'),
          errorFormatter.requiredValueViolation('dateProp'),
          errorFormatter.requiredValueViolation('datetimeProp'),
          errorFormatter.requiredValueViolation('booleanProp'),
          errorFormatter.requiredValueViolation('floatProp'),
          errorFormatter.requiredValueViolation('integerProp'),
          errorFormatter.requiredValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with values that are undefined', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: undefined,
        integerProp: undefined,
        floatProp: undefined,
        booleanProp: undefined,
        datetimeProp: undefined,
        dateProp: undefined,
        enumProp: undefined,
        attachmentReferenceProp: undefined,
        arrayProp: undefined,
        objectProp: undefined,
        hashtableProp: undefined,
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicDoc',
        [
          errorFormatter.requiredValueViolation('hashtableProp'),
          errorFormatter.requiredValueViolation('objectProp'),
          errorFormatter.requiredValueViolation('arrayProp'),
          errorFormatter.requiredValueViolation('attachmentReferenceProp'),
          errorFormatter.requiredValueViolation('enumProp'),
          errorFormatter.requiredValueViolation('dateProp'),
          errorFormatter.requiredValueViolation('datetimeProp'),
          errorFormatter.requiredValueViolation('booleanProp'),
          errorFormatter.requiredValueViolation('floatProp'),
          errorFormatter.requiredValueViolation('integerProp'),
          errorFormatter.requiredValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with values that are missing', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicDoc',
        [
          errorFormatter.requiredValueViolation('hashtableProp'),
          errorFormatter.requiredValueViolation('objectProp'),
          errorFormatter.requiredValueViolation('arrayProp'),
          errorFormatter.requiredValueViolation('attachmentReferenceProp'),
          errorFormatter.requiredValueViolation('enumProp'),
          errorFormatter.requiredValueViolation('dateProp'),
          errorFormatter.requiredValueViolation('datetimeProp'),
          errorFormatter.requiredValueViolation('booleanProp'),
          errorFormatter.requiredValueViolation('floatProp'),
          errorFormatter.requiredValueViolation('integerProp'),
          errorFormatter.requiredValueViolation('stringProp')
        ]);
    });
  });
});
