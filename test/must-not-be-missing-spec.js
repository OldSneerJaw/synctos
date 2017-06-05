var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Non-missing value constraint', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-must-not-be-missing-sync-function.js');
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
        arrayProp: [ '' ],
        objectProp: { subProp: 0 },
        hashtableProp: { 'key': 0.0 }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a doc with top-level values that are null', function() {
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

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a doc with nested values that are null', function() {
      var doc = {
        _id: 'staticDoc',
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-0700',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ null ],
        objectProp: { subProp: null },
        hashtableProp: { 'key': null },
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('blocks a doc with top-level values that are undefined', function() {
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
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp'),
          errorFormatter.mustNotBeMissingValueViolation('arrayProp'),
          errorFormatter.mustNotBeMissingValueViolation('attachmentReferenceProp'),
          errorFormatter.mustNotBeMissingValueViolation('enumProp'),
          errorFormatter.mustNotBeMissingValueViolation('dateProp'),
          errorFormatter.mustNotBeMissingValueViolation('datetimeProp'),
          errorFormatter.mustNotBeMissingValueViolation('booleanProp'),
          errorFormatter.mustNotBeMissingValueViolation('floatProp'),
          errorFormatter.mustNotBeMissingValueViolation('integerProp'),
          errorFormatter.mustNotBeMissingValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with nested values that are undefined', function() {
      var doc = {
        _id: 'staticDoc',
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-0700',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ undefined ],
        objectProp: { subProp: undefined },
        hashtableProp: { 'key': undefined },
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticDoc',
        [
          errorFormatter.mustNotBeMissingValueViolation('arrayProp[0]'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'),
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp[key]')
        ]);
    });

    it('blocks a doc with top-level values that are missing', function() {
      var doc = { _id: 'staticDoc' };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticDoc',
        [
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp'),
          errorFormatter.mustNotBeMissingValueViolation('arrayProp'),
          errorFormatter.mustNotBeMissingValueViolation('attachmentReferenceProp'),
          errorFormatter.mustNotBeMissingValueViolation('enumProp'),
          errorFormatter.mustNotBeMissingValueViolation('dateProp'),
          errorFormatter.mustNotBeMissingValueViolation('datetimeProp'),
          errorFormatter.mustNotBeMissingValueViolation('booleanProp'),
          errorFormatter.mustNotBeMissingValueViolation('floatProp'),
          errorFormatter.mustNotBeMissingValueViolation('integerProp'),
          errorFormatter.mustNotBeMissingValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with nested object property values that are missing', function() {
      var doc = {
        _id: 'staticDoc',
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-0700',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { },
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticDoc', errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'));
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
        arrayProp: [ '' ],
        objectProp: { subProp: 0 },
        hashtableProp: { 'key': 0.0 }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a doc with top-level values that are either null or undefined if enforcement is disabled', function() {
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

    it('allows a doc with nested values that are either null or undefined if enforcement is disabled', function() {
      var doc = {
        _id: 'dynamicDoc',
        arrayProp: [ null ],
        objectProp: { subProp: undefined },
        hashtableProp: { 'key': null }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a doc with top-level values that are null', function() {
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

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a doc with nested values that are null', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-0700',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ null ],
        objectProp: { subProp: null },
        hashtableProp: { 'key': null },
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('blocks a doc with top-level values that are undefined', function() {
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
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp'),
          errorFormatter.mustNotBeMissingValueViolation('arrayProp'),
          errorFormatter.mustNotBeMissingValueViolation('attachmentReferenceProp'),
          errorFormatter.mustNotBeMissingValueViolation('enumProp'),
          errorFormatter.mustNotBeMissingValueViolation('dateProp'),
          errorFormatter.mustNotBeMissingValueViolation('datetimeProp'),
          errorFormatter.mustNotBeMissingValueViolation('booleanProp'),
          errorFormatter.mustNotBeMissingValueViolation('floatProp'),
          errorFormatter.mustNotBeMissingValueViolation('integerProp'),
          errorFormatter.mustNotBeMissingValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with nested values that are undefined', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-0700',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ undefined ],
        objectProp: { subProp: undefined },
        hashtableProp: { 'key': undefined },
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicDoc',
        [
          errorFormatter.mustNotBeMissingValueViolation('arrayProp[0]'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'),
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp[key]')
        ]);
    });

    it('blocks a doc with top-level values that are missing', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicDoc',
        [
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp'),
          errorFormatter.mustNotBeMissingValueViolation('arrayProp'),
          errorFormatter.mustNotBeMissingValueViolation('attachmentReferenceProp'),
          errorFormatter.mustNotBeMissingValueViolation('enumProp'),
          errorFormatter.mustNotBeMissingValueViolation('dateProp'),
          errorFormatter.mustNotBeMissingValueViolation('datetimeProp'),
          errorFormatter.mustNotBeMissingValueViolation('booleanProp'),
          errorFormatter.mustNotBeMissingValueViolation('floatProp'),
          errorFormatter.mustNotBeMissingValueViolation('integerProp'),
          errorFormatter.mustNotBeMissingValueViolation('stringProp')
        ]);
    });

    it('blocks a doc with nested object property values that are missing', function() {
      var doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-0700',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { },
      };

      testHelper.verifyDocumentNotCreated(doc, 'dynamicDoc', errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'));
    });
  });
});
