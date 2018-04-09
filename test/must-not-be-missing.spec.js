const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Non-missing value constraint', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-must-not-be-missing-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('with static validation', () => {
    it('allows a doc with values that are neither null nor undefined', () => {
      const doc = {
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

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a doc with top-level values that are null', () => {
      const doc = {
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

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a doc with nested values that are null', () => {
      const doc = {
        _id: 'staticDoc',
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-07:00',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ null ],
        objectProp: { subProp: null },
        hashtableProp: { 'key': null },
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('blocks a doc with top-level values that are undefined', () => {
      const doc = {
        _id: 'staticDoc',
        stringProp: void 0,
        integerProp: void 0,
        floatProp: void 0,
        booleanProp: void 0,
        datetimeProp: void 0,
        dateProp: void 0,
        enumProp: void 0,
        attachmentReferenceProp: void 0,
        arrayProp: void 0,
        objectProp: void 0,
        hashtableProp: void 0,
      };

      testFixture.verifyDocumentNotCreated(
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

    it('blocks a doc with nested values that are undefined', () => {
      const doc = {
        _id: 'staticDoc',
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-07:00',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ void 0 ],
        objectProp: { subProp: void 0 },
        hashtableProp: { 'key': void 0 },
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticDoc',
        [
          errorFormatter.mustNotBeMissingValueViolation('arrayProp[0]'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'),
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp[key]')
        ]);
    });

    it('blocks a doc with top-level values that are missing', () => {
      const doc = { _id: 'staticDoc' };

      testFixture.verifyDocumentNotCreated(
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

    it('blocks a doc with nested object property values that are missing', () => {
      const doc = {
        _id: 'staticDoc',
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-07:00',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { },
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticDoc', errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'));
    });
  });

  describe('with dynamic validation', () => {
    it('allows a doc with values that are neither null nor undefined', () => {
      const doc = {
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

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a doc with top-level values that are either null or undefined if enforcement is disabled', () => {
      const doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: false,
        stringProp: null,
        integerProp: void 0,
        floatProp: null,
        booleanProp: void 0,
        datetimeProp: null,
        dateProp: void 0,
        enumProp: null,
        attachmentReferenceProp: void 0,
        arrayProp: null,
        objectProp: void 0,
        hashtableProp: null
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a doc with nested values that are either null or undefined if enforcement is disabled', () => {
      const doc = {
        _id: 'dynamicDoc',
        arrayProp: [ null ],
        objectProp: { subProp: void 0 },
        hashtableProp: { 'key': null }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a doc with top-level values that are null', () => {
      const doc = {
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

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a doc with nested values that are null', () => {
      const doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-07:00',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ null ],
        objectProp: { subProp: null },
        hashtableProp: { 'key': null },
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('blocks a doc with top-level values that are undefined', () => {
      const doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: void 0,
        integerProp: void 0,
        floatProp: void 0,
        booleanProp: void 0,
        datetimeProp: void 0,
        dateProp: void 0,
        enumProp: void 0,
        attachmentReferenceProp: void 0,
        arrayProp: void 0,
        objectProp: void 0,
        hashtableProp: void 0,
      };

      testFixture.verifyDocumentNotCreated(
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

    it('blocks a doc with nested values that are undefined', () => {
      const doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-07:00',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ void 0 ],
        objectProp: { subProp: void 0 },
        hashtableProp: { 'key': void 0 },
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicDoc',
        [
          errorFormatter.mustNotBeMissingValueViolation('arrayProp[0]'),
          errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'),
          errorFormatter.mustNotBeMissingValueViolation('hashtableProp[key]')
        ]);
    });

    it('blocks a doc with top-level values that are missing', () => {
      const doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true
      };

      testFixture.verifyDocumentNotCreated(
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

    it('blocks a doc with nested object property values that are missing', () => {
      const doc = {
        _id: 'dynamicDoc',
        dynamicPropsRequired: true,
        stringProp: 'foobar',
        integerProp: -45,
        floatProp: 5.19,
        booleanProp: true,
        datetimeProp: '2017-04-10T16:10:39.773-07:00',
        dateProp: '2017-04-10',
        enumProp: 2,
        attachmentReferenceProp: 'barfoo.baz',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { },
      };

      testFixture.verifyDocumentNotCreated(doc, 'dynamicDoc', errorFormatter.mustNotBeMissingValueViolation('objectProp.subProp'));
    });
  });
});
