var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');
var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

// Load the contents of the sync function file into a global variable called syncFunction
/*jslint evil: true */
eval('var syncFunction = ' + fs.readFileSync('build/sync-functions/test-general-sync-function.js').toString());
/*jslint evil: false */

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var requireRole;
var requireUser;
var channel;

describe('Functionality that is common to all documents:', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    requireRole = simple.stub();
    requireUser = simple.stub();
    channel = simple.stub();
  });

  describe('the document type identifier', function() {
    it('rejects document creation with an unrecognized doc type', function() {
      var doc = { _id: 'my-invalid-doc' };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('rejects document replacement with an unrecognized doc type', function() {
      var doc = { _id: 'my-invalid-doc', foo: 'bar' };
      var oldDoc = { _id: 'my-invalid-doc' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('rejects document deletion with an unrecognized type', function() {
      var doc = { _id: 'my-invalid-doc', _deleted: true };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });
  });

  describe('type validation', function() {
    beforeEach(function() {
      testHelper.init('build/sync-functions/test-general-sync-function.js');
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
  });

  it('cannot specify whitelisted properties below the root level of the document', function() {
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

    expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
      testHelper.verifyValidationErrors(
        'generalDoc',
        [
          errorFormatter.unsupportedProperty('objectProp._id'),
          errorFormatter.unsupportedProperty('objectProp._rev'),
          errorFormatter.unsupportedProperty('objectProp._deleted'),
          errorFormatter.unsupportedProperty('objectProp._revisions'),
          errorFormatter.unsupportedProperty('objectProp._attachments')
        ],
        ex);
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

    expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
      testHelper.verifyValidationErrors('generalDoc', errorFormatter.allowAttachmentsViolation(), ex);
    });
  });
});
