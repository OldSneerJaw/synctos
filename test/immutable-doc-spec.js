var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/sync-functions/test-immutable-doc-sync-function.js').toString());

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('Immutable document validation parameter', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  it('can create a document if the old document does not exist', function() {
    var doc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };

    syncFunction(doc);

    verifyDocumentCreated();
  });

  it('can create a document if the old document was deleted', function() {
    var doc = {
      _id: 'immutableDoc',
      stringProp: 'barfoo'
    };
    var oldDoc = { _id: 'immutableDoc', _deleted: true };

    syncFunction(doc, oldDoc);

    verifyDocumentCreated();
  });

  it('can delete a document if the old document was already deleted', function() {
    // There doesn't seem to be much point in deleting something that is already deleted, but since Sync Gateway allows you to do it, check
    // that it works properly
    var doc = { _id: 'immutableDoc', _deleted: true };
    var oldDoc = { _id: 'immutableDoc', _deleted: true };

    syncFunction(doc, oldDoc);

    verifyDocumentDeleted();
  });

  it('cannot replace a document even if its properties have not been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('documents of this type cannot be replaced or deleted');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });

  it('cannot delete a document', function() {
    var doc = {
      _id: 'immutableDoc',
      _deleted: true
    };
    var oldDoc = {
      _id: 'immutableDoc',
      stringProp: 'foobar'
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('documents of this type cannot be replaced or deleted');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });

  it('cannot modify attachments after the document has been created', function() {
    var doc = {
      _id: 'immutableDoc',
      _attachments: {
        'bar.pdf': {
          'content_type': 'application/pdf'
        }
      },
      stringProp: 'foobar'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      _attachments: {
        'foo.pdf': {
          'content_type': 'application/pdf'
        }
      },
      stringProp: 'foobar'
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('documents of this type cannot be replaced or deleted');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });
});

function verifyDocumentWriteAccepted(expectedChannel) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.equal(expectedChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.contain(expectedChannel);
}

function verifyDocumentCreated() {
  verifyDocumentWriteAccepted('add');
}

function verifyDocumentDeleted() {
  verifyDocumentWriteAccepted('remove');
}

function verifyDocumentWriteDenied() {
  expect(requireAccess.callCount).to.equal(1);
  expect(channel.callCount).to.equal(0);
}

function numberOfValidationErrors(message) {
  return message.split(';').length;
}
