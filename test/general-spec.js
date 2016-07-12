var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');
var testHelper = require('../etc/test-helper.js');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/sync-functions/test-general-sync-function.js').toString());

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

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ 'property "unsupportedProperty" is not supported' ], 'add');
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
        [ 'property "unsupportedProperty" is not supported' ],
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

      testHelper.verifyDocumentNotCreated(doc, 'generalDoc', [ 'property "objectProp.unsupportedProperty" is not supported' ], 'add');
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
        [ 'property "objectProp.unsupportedProperty" is not supported' ],
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
          'property "objectProp._id" is not supported',
          'property "objectProp._rev" is not supported',
          'property "objectProp._deleted" is not supported',
          'property "objectProp._revisions" is not supported',
          'property "objectProp._attachments" is not supported'
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
      testHelper.verifyValidationErrors('generalDoc', 'document type does not support attachments', ex);
    });
  });
});
