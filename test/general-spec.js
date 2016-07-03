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

describe('Functionality that is common to all documents', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  describe('unrecognized document types', function() {
    it('cannot create a document with an unrecognized type', function() {
      var doc = { _id: 'my-invalid-doc' };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('cannot replace a document with an unrecognized type', function() {
      var doc = { _id: 'my-invalid-doc', foo: 'bar' };
      var oldDoc = { _id: 'my-invalid-doc' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('cannot delete a document with an unrecognized type', function() {
      var doc = { _id: 'my-invalid-doc', _deleted: true };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });
  });

  describe('access control', function() {
    it('cannot create a document for a user without permission', function() {
      var doc = { _id: 'generalDoc', objectProp: { foo: 'bar' } };
      var expectedError = new Error('access denied');

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.message).to.equal(expectedError.message);
      });
      expect(requireAccess.callCount).to.be(1);
      expect(requireAccess.calls[0].arg).to.equal('add');
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = { _id: 'generalDoc', objectProp: { } };
      var oldDoc = { _id: 'generalDoc' };
      var expectedError = new Error('access denied');

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex.message).to.equal(expectedError.message);
      });
      expect(requireAccess.callCount).to.be(1);
      expect(requireAccess.calls[0].arg).to.contain('update');
      expect(requireAccess.calls[0].arg).to.contain('replace');
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { _id: 'generalDoc', _deleted: true };
      var expectedError = new Error('access denied');

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.message).to.equal(expectedError.message);
      });
      expect(requireAccess.callCount).to.be(1);
      expect(requireAccess.calls[0].arg.length).to.be(2);
      expect(requireAccess.calls[0].arg).to.contain('delete');
      expect(requireAccess.calls[0].arg).to.contain('remove');
    });
  });

  describe('channel assignment', function() {
    const allChannels = [ 'add', 'update', 'replace', 'view', 'delete', 'remove' ];

    function verifyChannelArgs() {
      expect(channel.callCount).to.be(1);

      var channelArg = channel.calls[0].arg;
      expect(channelArg.length).to.equal(allChannels.length);

      for (var channelIndex = 0; channelIndex < allChannels.length; channelIndex++) {
        expect(channelArg).to.contain(allChannels[channelIndex]);
      }
    }

    it('includes all configured channels when assigning channels to a new document', function() {
      var doc = { _id: 'generalDoc', objectProp: { foo: 'bar' } };

      syncFunction(doc);

      verifyChannelArgs();
    });

    it('includes all configured channels when assigning channels to a replaced document', function() {
      var doc = { _id: 'generalDoc', objectProp: { foo: 'baz' } };
      var oldDoc = { _id: 'generalDoc', objectProp: { foo: 'bar' } };

      syncFunction(doc);

      verifyChannelArgs();
    });

    it('includes all configured channels when assigning channels to a deleted document', function() {
      var doc = { _id: 'generalDoc', objectProp: { foo: 'bar' } };

      syncFunction(doc);

      verifyChannelArgs();
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
      testHelper.verifyValidationErrors('generalDoc', [ 'document type does not support attachments' ], ex);
    });
  });
});
