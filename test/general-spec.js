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
var channel;

describe('Functionality that is common to all documents:', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
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

  describe('validator of supported properties', function() {
    beforeEach(function() {
      testHelper.init('build/sync-functions/test-general-sync-function.js');
    });

    it('rejects a property that is not supported at the root level when a document is created', function() {
      var doc = {
        _id: 'generalDoc',
        objectProp: { foo: 'bar' },
        unsupportedProperty: 'invalid!'
      };

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ errorFormatter.unsupportedProperty('unsupportedProperty') ], 'add');
    });

    it('rejects a property that is not supported at the root level when a document is replaced', function() {
      var doc = {
        _id: 'generalDoc',
        objectProp: { foo: 'bar' },
        unsupportedProperty: 'invalid!'
      };
      var oldDoc = { _id: 'generalDoc' };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'generalDoc',
        [ errorFormatter.unsupportedProperty('unsupportedProperty') ],
        [ 'replace', 'update' ]);
    });

    it('rejects an unsupported property that is nested in an object when a document is created', function() {
      var doc = {
        _id: 'generalDoc',
        objectProp: {
          foo: 'bar',
          unsupportedProperty: 'invalid!'
        }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'generalDoc',
        [ errorFormatter.unsupportedProperty('objectProp.unsupportedProperty') ],
        'add');
    });

    it('rejects an unsupported property that is nested in an object when a document is replaced', function() {
      var doc = {
        _id: 'generalDoc',
        objectProp: {
          foo: 'bar',
          unsupportedProperty: 'invalid!'
        }
      };
      var oldDoc = { _id: 'generalDoc' };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'generalDoc',
        [ errorFormatter.unsupportedProperty('objectProp.unsupportedProperty') ],
        [ 'replace', 'update' ]);
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
