const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Strict immutable when set constraint:', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-immutable-when-set-strict-sync-function.js');
  });

  describe('a property with static validation', () => {
    it('can be set to a value in a new document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can be left undefined in a new document', () => {
      const doc = {
        _id: 'myDoc'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can be set to null in a new document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: null
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can be set to the same value as was already assigned in the old document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a value if it was left undefined in the old document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };
      const oldDoc = {
        _id: 'myDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to null if it was undefined in the old document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: null
      };
      const oldDoc = {
        _id: 'myDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to undefined if it was null in the old document', () => {
      const doc = {
        _id: 'myDoc'
      };
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a value if it was null in the old document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot be changed to a new value if it was set to a value in the old document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: 'barfoo'
      };
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('staticValidationProp'));
    });

    it('cannot be change to undefined if it was set to a value in the old document', () => {
      const doc = {
        _id: 'myDoc'
      };
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('staticValidationProp'));
    });

    it('cannot be changed to null if it was set to a value in the old document', () => {
      const doc = {
        _id: 'myDoc',
        staticValidationProp: null
      };
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('staticValidationProp'));
    });

    it('does not prevent a document from being deleted if it is set to a value', () => {
      const oldDoc = {
        _id: 'myDoc',
        staticValidationProp: 'foobar'
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });
  });

  describe('a property with dynamic validation', () => {
    it('can be set to the same value as was already assigned in the old document', () => {
      const doc = {
        _id: 'myDoc',
        dynamicValidationProp: 42,
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'myDoc',
        dynamicValidationProp: 42,
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can be set to a new value if the property is not immutable', () => {
      const doc = {
        _id: 'myDoc',
        dynamicValidationProp: -1,
        dynamicPropertiesAreImmutable: false
      };
      const oldDoc = {
        _id: 'myDoc',
        dynamicValidationProp: 42,
        dynamicPropertiesAreImmutable: false
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot be set to a new value if the property is immutable', () => {
      const doc = {
        _id: 'myDoc',
        dynamicValidationProp: 0,
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'myDoc',
        dynamicValidationProp: -1,
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', errorFormatter.immutableItemViolation('dynamicValidationProp'));
    });
  });

  describe('for specialized string types', () => {
    it('allow values that match the old values exactly', () => {
      const oldDoc = {
        _id: 'myDoc',
        staticImmutableDateProp: '0975-06-15',
        staticImmutableDatetimeProp: '3999-12-31T23:59:59.999+00:00',
        staticImmutableTimeProp: '16:29',
        staticImmutableTimezoneProp: '+05:00',
        staticImmutableUuidProp: '91d7ba3c-e827-4619-842d-3d1b07bf39f7'
      };

      const doc = {
        _id: 'myDoc',
        staticImmutableDateProp: '0975-06-15',
        staticImmutableDatetimeProp: '3999-12-31T23:59:59.999+00:00',
        staticImmutableTimeProp: '16:29',
        staticImmutableTimezoneProp: '+05:00',
        staticImmutableUuidProp: '91d7ba3c-e827-4619-842d-3d1b07bf39f7'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('reject values that are semantically equal to the old values but not strictly equal', () => {
      const oldDoc = {
        _id: 'myDoc',
        staticImmutableDateProp: '1935',
        staticImmutableDatetimeProp: '1621T18:24Z',
        staticImmutableTimeProp: '00:12',
        staticImmutableTimezoneProp: '-10:30',
        staticImmutableUuidProp: '0b028c34-4891-4427-8e9d-9122163d28c4'
      };

      const doc = {
        _id: 'myDoc',
        staticImmutableDateProp: '1935-01-01',
        staticImmutableDatetimeProp: '1621-01-01T18:24:00.000Z',
        staticImmutableTimeProp: '00:12:00.000',
        staticImmutableTimezoneProp: '-1030',
        staticImmutableUuidProp: oldDoc.staticImmutableUuidProp.toUpperCase()
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'myDoc',
        [
          errorFormatter.immutableItemViolation('staticImmutableDateProp'),
          errorFormatter.immutableItemViolation('staticImmutableDatetimeProp'),
          errorFormatter.immutableItemViolation('staticImmutableTimeProp'),
          errorFormatter.immutableItemViolation('staticImmutableTimezoneProp'),
          errorFormatter.immutableItemViolation('staticImmutableUuidProp'),
        ]);
    });
  });
});
