var { expect } = require('chai');
var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Functionality that is common to all documents:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-general-sync-function.js');
  });

  describe('the document type identifier', function() {
    it('rejects document creation with an unrecognized doc type', function() {
      var doc = { _id: 'my-invalid-doc' };

      var syncFuncError = null;
      expect(function() {
        try {
          testHelper.syncFunction(doc);
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(syncFuncError).to.eql({ forbidden: 'Unknown document type' });
    });

    it('rejects document replacement with an unrecognized doc type', function() {
      var doc = { _id: 'my-invalid-doc', foo: 'bar' };
      var oldDoc = { _id: 'my-invalid-doc' };

      var syncFuncError = null;
      expect(function() {
        try {
          testHelper.syncFunction(doc, oldDoc);
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(syncFuncError).to.eql({ forbidden: 'Unknown document type' });
    });

    it('allows a missing document to be "deleted" even if the type is unrecognized', function() {
      var doc = { _id: 'my-invalid-doc', _deleted: true };

      // When deleting a document that does not exist and the document's type cannot be determined, the fallback
      // behaviour is to allow it to be deleted and assign the public channel to it
      testHelper.verifyDocumentAccepted(doc, void 0, [ '!' ]);
    });

    it('allows a deleted document to be deleted again even if the type is unrecognized', function() {
      var doc = { _id: 'my-invalid-doc', _deleted: true };
      var oldDoc = { _id: 'my-invalid-doc', _deleted: true };

      // When deleting a document that was already deleted and the document's type cannot be determined, the fallback
      // behaviour is to allow it to be deleted and assign the public channel to it
      testHelper.verifyDocumentAccepted(doc, oldDoc, [ '!' ]);
    });
  });

  describe('type validation', function() {
    beforeEach(function() {
      testHelper.initSyncFunction('build/sync-functions/test-general-sync-function.js');
    });

    it('rejects an array property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        arrayProp: { }
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('arrayProp', 'array') ], 'add');
    });

    it('rejects an attachment reference property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        attachmentReferenceProp: { }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [ errorFormatter.typeConstraintViolation('attachmentReferenceProp', 'attachmentReference') ],
        'add');
    });

    it('rejects a boolean property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        booleanProp: 0
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('booleanProp', 'boolean') ], 'add');
    });

    it('rejects a date property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        dateProp: 1468713600000
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('dateProp', 'date') ], 'add');
    });

    it('rejects a date/time property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        datetimeProp: 1468795446123
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('datetimeProp', 'datetime') ], 'add');
    });

    it('rejects a floating point number property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        floatProp: false
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('floatProp', 'float') ], 'add');
    });

    it('rejects a hashtable property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        hashtableProp: [ ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('hashtableProp', 'hashtable') ], 'add');
    });

    it('rejects an integer property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        integerProp: -15.9
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('integerProp', 'integer') ], 'add');
    });

    it('rejects an object property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        objectProp: [ ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('objectProp', 'object') ], 'add');
    });

    it('rejects a string property value that is not the right type', function() {
      var doc = {
        _id: 'generalDoc',
        stringProp: 99
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.typeConstraintViolation('stringProp', 'string') ], 'add');
    });

    it('allows a value of the right type for a dynamic property type', function() {
      var doc = {
        _id: 'generalDoc',
        dynamicTypeProp: -56,
        expectedDynamicType: 'integer',
        expectedDynamicMinimumValue: -56,
        expectedDynamicMinimumExclusiveValue: -57,
        expectedDynamicMaximumValue: -56,
        expectedDynamicMaximumExclusiveValue: -55
      };

      testHelper.verifyDocumentCreated(doc, 'add');
    });

    it('rejects a value that falls outside the minimum and maximum values for a dynamic property type', function() {
      var doc = {
        _id: 'generalDoc',
        dynamicTypeProp: 0,
        expectedDynamicType: 'integer',
        expectedDynamicMinimumValue: 1,
        expectedDynamicMinimumExclusiveValue: 0,
        expectedDynamicMaximumValue: -1,
        expectedDynamicMaximumExclusiveValue: 0
      };

      testHelper.verifyDocumentNotCreated(
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

    it('rejects a value of the wrong type for a dynamic property type', function() {
      var doc = {
        _id: 'generalDoc',
        dynamicTypeProp: 9.5,
        expectedDynamicType: 'string'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [ errorFormatter.typeConstraintViolation('dynamicTypeProp', 'string') ],
        'add');
    });
  });

  describe('internal document property validation', function() {
    it('allows internal properties at the root level of the document', function() {
      var doc = {
        _id: 'generalDoc',
        _rev: 'my-rev',
        _deleted: false,
        _revisions: { },
        _attachments: { },
        _someOtherProperty: 'my-value'
      };

      testHelper.verifyDocumentCreated(doc, [ 'add' ]);
    });

    it('rejects internal properties below the root level of the document', function() {
      var doc = {
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

      var syncFuncError = null;
      expect(function() {
        try {
          testHelper.syncFunction(doc);
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      testHelper.verifyValidationErrors(
        'generalDoc',
        [
          errorFormatter.unsupportedProperty('objectProp._id'),
          errorFormatter.unsupportedProperty('objectProp._rev'),
          errorFormatter.unsupportedProperty('objectProp._deleted'),
          errorFormatter.unsupportedProperty('objectProp._revisions'),
          errorFormatter.unsupportedProperty('objectProp._attachments')
        ],
        syncFuncError);
    });
  });

  it('cannot include attachments in documents that do not explicitly allow them', function() {
    var doc = {
      '_id': 'generalDoc',
      '_attachments': {
        'foo.pdf': {
          'content_type': 'application/pdf',
          'length': 2097152
        }
      }
    };

    var syncFuncError = null;
    expect(function() {
      try {
        testHelper.syncFunction(doc);
      } catch (ex) {
        syncFuncError = ex;

        throw ex;
      }
    }).to.throw();

    testHelper.verifyValidationErrors('generalDoc', errorFormatter.allowAttachmentsViolation(), syncFuncError);
  });
});
