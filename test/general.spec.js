const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Functionality that is common to all documents:', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-general-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('the document type identifier', () => {
    it('rejects document creation with an unrecognized doc type', () => {
      const doc = { _id: 'my-invalid-doc' };

      testFixture.verifyUnknownDocumentType(doc, null);
    });

    it('rejects document replacement with an unrecognized doc type', () => {
      const doc = { _id: 'my-invalid-doc', foo: 'bar' };
      const oldDoc = { _id: 'my-invalid-doc' };

      testFixture.verifyUnknownDocumentType(doc, oldDoc);
    });

    it('allows a document to be deleted by an administrator even if the type is unrecognized', () => {
      const oldDoc = { _id: 'my-invalid-doc', _deleted: true };

      testFixture.verifyDocumentDeleted(oldDoc, [ ]);
    });

    it('allows a missing document to be "deleted" by an administrator even if the type is unrecognized', () => {
      const doc = { _id: 'my-invalid-doc', _deleted: true };

      // When deleting a document that does not exist and the document's type cannot be determined, the fallback
      // behaviour is to allow it to be deleted by an admin
      testFixture.verifyDocumentAccepted(doc, void 0, [ ]);
    });

    it('allows a deleted document to be deleted again by an administrator even if the type is unrecognized', () => {
      const doc = { _id: 'my-invalid-doc', _deleted: true };
      const oldDoc = { _id: 'my-invalid-doc', _deleted: true };

      // When deleting a document that was already deleted and the document's type cannot be determined, the fallback
      // behaviour is to allow it to be deleted by an admin
      testFixture.verifyDocumentAccepted(doc, oldDoc, [ ]);
    });
  });

  describe('type validation', () => {
    it('rejects an array property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        arrayProp: { }
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('arrayProp', 'array') ], 'add');
    });

    it('rejects an attachment reference property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        attachmentReferenceProp: { }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [ errorFormatter.typeConstraintViolation('attachmentReferenceProp', 'attachmentReference') ],
        'add');
    });

    it('rejects a boolean property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        booleanProp: 0
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('booleanProp', 'boolean') ], 'add');
    });

    it('rejects a date property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        dateProp: 1468713600000
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('dateProp', 'date') ], 'add');
    });

    it('rejects a date/time property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        datetimeProp: 1468795446123
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('datetimeProp', 'datetime') ], 'add');
    });

    it('rejects a floating point number property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        floatProp: false
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('floatProp', 'float') ], 'add');
    });

    it('rejects a hashtable property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        hashtableProp: [ ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('hashtableProp', 'hashtable') ], 'add');
    });

    it('rejects an integer property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        integerProp: -15.9
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('integerProp', 'integer') ], 'add');
    });

    it('rejects an object property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        objectProp: [ ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('objectProp', 'object') ], 'add');
    });

    it('rejects a string property value that is not the right type', () => {
      const doc = {
        _id: 'generalDoc',
        stringProp: 99
      };

      testFixture.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('stringProp', 'string') ], 'add');
    });

    it('allows a value of the right type for a dynamic property type', () => {
      const doc = {
        _id: 'generalDoc',
        dynamicTypeProp: -56,
        expectedDynamicType: 'integer',
        expectedDynamicMinimumValue: -56,
        expectedDynamicMinimumExclusiveValue: -57,
        expectedDynamicMaximumValue: -56,
        expectedDynamicMaximumExclusiveValue: -55
      };

      testFixture.verifyDocumentCreated(doc, 'add');
    });

    it('rejects a value that falls outside the minimum and maximum values for a dynamic property type', () => {
      const doc = {
        _id: 'generalDoc',
        dynamicTypeProp: 0,
        expectedDynamicType: 'integer',
        expectedDynamicMinimumValue: 1,
        expectedDynamicMinimumExclusiveValue: 0,
        expectedDynamicMaximumValue: -1,
        expectedDynamicMaximumExclusiveValue: 0
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [
          errorFormatter.minimumValueViolation('dynamicTypeProp', 1),
          errorFormatter.minimumValueExclusiveViolation('dynamicTypeProp', 0),
          errorFormatter.maximumValueViolation('dynamicTypeProp', -1),
          errorFormatter.maximumValueExclusiveViolation('dynamicTypeProp', 0)
        ],
        'add');
    });

    it('rejects a value of the wrong type for a dynamic property type', () => {
      const doc = {
        _id: 'generalDoc',
        dynamicTypeProp: 9.5,
        expectedDynamicType: 'string'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [ errorFormatter.typeConstraintViolation('dynamicTypeProp', 'string') ],
        'add');
    });
  });

  describe('internal document property validation', () => {
    it('allows internal properties at the root level of the document', () => {
      const doc = {
        _id: 'generalDoc',
        _rev: 'my-rev',
        _deleted: false,
        _revisions: { },
        _attachments: { },
        _someOtherProperty: 'my-value'
      };

      testFixture.verifyDocumentCreated(doc, [ 'add' ]);
    });

    it('rejects internal properties below the root level of the document', () => {
      const doc = {
        _id: 'generalDoc',
        objectProp: {
          foo: 'bar',
          _id: 'my-id',
          _rev: 'my-rev',
          _deleted: true,
          _revisions: { },
          _attachments: { }
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [
          errorFormatter.unsupportedProperty('objectProp._id'),
          errorFormatter.unsupportedProperty('objectProp._rev'),
          errorFormatter.unsupportedProperty('objectProp._deleted'),
          errorFormatter.unsupportedProperty('objectProp._revisions'),
          errorFormatter.unsupportedProperty('objectProp._attachments')
        ],
        [ 'add' ]);
    });
  });

  it('cannot include attachments in documents that do not explicitly allow them', () => {
    const doc = {
      '_id': 'generalDoc',
      '_attachments': {
        'foo.pdf': {
          'content_type': 'application/pdf',
          'length': 2097152
        }
      }
    };

    testFixture.verifyDocumentNotCreated(doc, 'generalDoc', errorFormatter.allowAttachmentsViolation(), [ 'add' ]);
  });
});
