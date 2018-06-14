const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Skip validation for unchanged value constraint:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-skip-validation-when-value-unchanged-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('with static validation', () => {
    it('allows document creation with valid values', () => {
      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: 49,
        floatProp: -153.9,
        stringProp: 'a-string',
        booleanProp: true,
        dateProp: '1953-01-14',
        datetimeProp: '2018-06-13T16:33-07:00',
        timeProp: '17:45:53.912',
        timezoneProp: '+15:15',
        enumProp: 3,
        uuidProp: '0d852732-81f0-4501-bb13-2c1ebc98d8f6',
        attachmentReferenceProp: 'foobar.txt',
        arrayProp: [ 'a', 'b', 'c' ],
        objectProp: { nestedProp: 'foo' },
        hashtableProp: { bar: -7 }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows document replacement with invalid values that semantically equal the original values', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1,
        floatProp: 14.36,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-13T16:33-08:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34f0d4a2-bc77-4aea-b3fd-d579b66ee4bc',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1.0,
        floatProp: 14.360,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-14T01:33:00+01:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34F0D4A2-BC77-4AEA-B3FD-D579B66EE4BC',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows document replacement of invalid values with valid values', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1,
        floatProp: 14.36,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-13T16:33-08:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34f0d4a2-bc77-4aea-b3fd-d579b66ee4bc',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: 0,
        floatProp: 0,
        stringProp: 'foobar',
        booleanProp: true,
        dateProp: '1952-12-31',
        datetimeProp: '2018-06-13T16:03-07:30',
        timeProp: '18:21:35',
        timezoneProp: 'Z',
        enumProp: 1,
        uuidProp: '094b0d17-f266-4a10-af04-8b6ae0312131',
        attachmentReferenceProp: 'barbaz.txt',
        arrayProp: [ ],
        objectProp: { },
        hashtableProp: { foo: 5564 }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows document replacement of invalid values with null values', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1,
        floatProp: 14.36,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-13T16:33-08:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34f0d4a2-bc77-4aea-b3fd-d579b66ee4bc',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: null,
        floatProp: null,
        stringProp: null,
        booleanProp: null,
        dateProp: null,
        datetimeProp: null,
        timeProp: null,
        timezoneProp: null,
        enumProp: null,
        uuidProp: null,
        attachmentReferenceProp: null,
        arrayProp: null,
        objectProp: null,
        hashtableProp: null
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows document replacement of invalid values with undefined values', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1,
        floatProp: 14.36,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-13T16:33-08:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34f0d4a2-bc77-4aea-b3fd-d579b66ee4bc',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects document creation with invalid values', () => {
      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1,
        floatProp: 14.36,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-13T16:33-08:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34f0d4a2-bc77-4aea-b3fd-d579b66ee4bc',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticSkipValidationWhenValueUnchangedDoc',
        [
          errorFormatter.minimumValueViolation('integerProp', 0),
          errorFormatter.maximumValueViolation('floatProp', 0),
          errorFormatter.minimumLengthViolation('stringProp', 4),
          'booleanProp must be true',
          errorFormatter.maximumValueViolation('dateProp', '1953-01-14'),
          errorFormatter.maximumValueViolation('datetimeProp', '2018-06-13T23:33Z'),
          errorFormatter.minimumValueExclusiveViolation('timeProp', '17:45:53.911'),
          errorFormatter.maximumValueExclusiveViolation('timezoneProp', '+15:30'),
          errorFormatter.enumPredefinedValueViolation('enumProp', [ 1, 2, 3 ]),
          errorFormatter.maximumValueExclusiveViolation('uuidProp', '10000000-0000-0000-0000-000000000000'),
          errorFormatter.attachmentReferenceRegexPatternViolation('attachmentReferenceProp', /^[a-z]+\.txt$/),
          errorFormatter.maximumLengthViolation('arrayProp', 3),
          errorFormatter.unsupportedProperty('objectProp.foo'),
          errorFormatter.typeConstraintViolation('hashtableProp[bar]', 'integer')
        ]);
    });

    it('rejects document replacement with invalid values', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: 49,
        floatProp: -153.9,
        stringProp: 'a-string',
        booleanProp: true,
        dateProp: '1953-01-14',
        datetimeProp: '2018-06-13T16:33-07:00',
        timeProp: '17:45:53.912',
        timezoneProp: '+15:15',
        enumProp: 3,
        uuidProp: '0d852732-81f0-4501-bb13-2c1ebc98d8f6',
        attachmentReferenceProp: 'foobar.txt',
        arrayProp: [ 'a', 'b', 'c' ],
        objectProp: { nestedProp: 'foo' },
        hashtableProp: { bar: -7 }
      };

      const doc = {
        _id: 'my-doc',
        type: 'staticSkipValidationWhenValueUnchangedDoc',
        integerProp: -1,
        floatProp: 14.36,
        stringProp: 'foo',
        booleanProp: false,
        dateProp: '1953-01-15',
        datetimeProp: '2018-06-13T16:33-08:00',
        timeProp: '17:45:53.911',
        timezoneProp: '+15:30',
        enumProp: 'a',
        uuidProp: '34f0d4a2-bc77-4aea-b3fd-d579b66ee4bc',
        attachmentReferenceProp: 'foobar.baz',
        arrayProp: [ 'a', 'b', 'c', 'd' ],
        objectProp: { foo: 'bar' },
        hashtableProp: { bar: 'baz' }
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'staticSkipValidationWhenValueUnchangedDoc',
        [
          errorFormatter.minimumValueViolation('integerProp', 0),
          errorFormatter.maximumValueViolation('floatProp', 0),
          errorFormatter.minimumLengthViolation('stringProp', 4),
          'booleanProp must be true',
          errorFormatter.maximumValueViolation('dateProp', '1953-01-14'),
          errorFormatter.maximumValueViolation('datetimeProp', '2018-06-13T23:33Z'),
          errorFormatter.minimumValueExclusiveViolation('timeProp', '17:45:53.911'),
          errorFormatter.maximumValueExclusiveViolation('timezoneProp', '+15:30'),
          errorFormatter.enumPredefinedValueViolation('enumProp', [ 1, 2, 3 ]),
          errorFormatter.maximumValueExclusiveViolation('uuidProp', '10000000-0000-0000-0000-000000000000'),
          errorFormatter.attachmentReferenceRegexPatternViolation('attachmentReferenceProp', /^[a-z]+\.txt$/),
          errorFormatter.maximumLengthViolation('arrayProp', 3),
          errorFormatter.unsupportedProperty('objectProp.foo'),
          errorFormatter.typeConstraintViolation('hashtableProp[bar]', 'integer')
        ]);
    });
  });

  describe('with dynamic validation', () => {
    it('allows document creation with valid values', () => {
      const doc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        allowValidationSkip: true,
        uuidProp: '7ed6ad77-b18f-4a1a-bf72-6e74a22b88c1',
        minimumUuidValue: '70000000-0000-0000-0000-000000000000'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows document replacement with equal invalid values when validation is allowed to be skipped', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        allowValidationSkip: true,
        uuidProp: '189331f4-62dd-4036-90e5-291648b05e38'
      };

      const doc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        uuidProp: '189331F4-62DD-4036-90E5-291648B05E38', // Same value; just converted to uppercase
        minimumUuidValue: '20000000-0000-0000-0000-000000000000'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects document creation with invalid values', () => {
      const doc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        allowValidationSkip: true,
        uuidProp: '0b352e9b-1c1f-433a-9c98-dd0242127185',
        minimumUuidValue: '10000000-0000-0000-0000-000000000000'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicSkipValidationWhenValueUnchangedDoc',
        [ errorFormatter.minimumValueViolation('uuidProp', '10000000-0000-0000-0000-000000000000') ]);
    });

    it('rejects document replacement with unequal invalid values when validation is allowed to be skipped', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        allowValidationSkip: true,
        uuidProp: '4b424579-81c9-4740-9511-eca9c8a89f95'
      };

      const doc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        uuidProp: '1d9d9668-249e-47fe-95e0-06cdac93f0f1',
        minimumUuidValue: '50000000-0000-0000-0000-000000000000'
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'dynamicSkipValidationWhenValueUnchangedDoc',
        [ errorFormatter.minimumValueViolation('uuidProp', '50000000-0000-0000-0000-000000000000') ]);
    });

    it('rejects document replacement with equal invalid values when validation is NOT allowed to be skipped', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        allowValidationSkip: false,
        uuidProp: '22632a18-4045-4dfc-a5f0-23d2aa6af894'
      };

      const doc = {
        _id: 'my-doc',
        type: 'dynamicSkipValidationWhenValueUnchangedDoc',
        uuidProp: '22632a18-4045-4dfc-a5f0-23d2aa6af894',
        minimumUuidValue: 'd0000000-0000-0000-0000-000000000000'
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'dynamicSkipValidationWhenValueUnchangedDoc',
        [ errorFormatter.minimumValueViolation('uuidProp', 'd0000000-0000-0000-0000-000000000000') ]);
    });
  });
});
