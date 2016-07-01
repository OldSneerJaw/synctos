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
      arrayProp: [ 'foo' ],
      objectProp: { foo: 'bar' },
      hashtableProp: { bar: 'baz' },
      stringProp: 'foobar'
    };

    syncFunction(doc);

    verifyDocumentCreated();
  });

  it('can create a document if the old document was deleted', function() {
    var doc = {
      _id: 'immutableDoc',
      arrayProp: [ 'foo' ],
      objectProp: { foo: 'bar' },
      hashtableProp: { bar: 'baz' },
      stringProp: 'foobar'
    };
    var oldDoc = { _id: 'immutableDoc', _deleted: true };

    syncFunction(doc, oldDoc);

    verifyDocumentCreated();
  });

  it('can replace a document that has not been modified', function() {
    // The attachments property has been added but it is empty, which is functionally equal to null or undefined in this one case
    var doc = {
      _id: 'immutableDoc',
      _rev: 'rev1',
      _attachments: { },
      arrayProp: [ 'foo' ],
      objectProp: { foo: 'bar' },
      hashtableProp: { bar: 'baz' },
      stringProp: 'foobar'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      _rev: 'rev1',
      arrayProp: [ 'foo' ],
      objectProp: { foo: 'bar' },
      hashtableProp: { bar: 'baz' },
      stringProp: 'foobar'
    };

    syncFunction(doc, oldDoc);

    verifyDocumentReplaced();
  });

  it('can replace a document when replacing null values with undefined or vice versa', function() {
    // The revision property has been removed (i.e. it was specified via the "rev" query string param instead), but otherwise they're equal
    var doc = {
      _id: 'immutableDoc',
      objectProp: { },
      stringProp: null
    };
    var oldDoc = {
      _id: 'immutableDoc',
      _rev: 'rev1',
      arrayProp: null,
      objectProp: { foo: null },
      hashtableProp: null
    };

    syncFunction(doc, oldDoc);

    verifyDocumentReplaced();
  });

  it('cannot replace a document when the attachments have been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      _rev: 'rev1',
      _attachments: {
        'foobar.pdf': {
          'content_type': 'application/pdf'
        }
      },
      stringProp: 'foobar'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      _rev: 'rev1',
      stringProp: 'foobar'
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('attachments of this document may not be modified');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });

  it('cannot replace a document when a root-level simple type property has been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'baz' },
      stringProp: 'CHANGED'
    };
    var oldDoc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'baz' },
      stringProp: 'foobar'
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('properties of this document may not be modified');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });

  it('cannot replace a document when a property nested in an array has been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'CHANGED' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'baz' }
    };
    var oldDoc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'baz' }
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('properties of this document may not be modified');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });

  it('cannot replace a document when a property nested in an object has been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'CHANGED' ] },
      hashtableProp: { bar: 'baz' }
    };
    var oldDoc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'baz' }
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('properties of this document may not be modified');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });

  it('cannot replace a document when a property nested in a hashtable has been modified', function() {
    var doc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'CHANGED' }
    };
    var oldDoc = {
      _id: 'immutableDoc',
      arrayProp: [ { foo: 'baz' } ],
      objectProp: { foo: [ 'bar' ] },
      hashtableProp: { bar: 'baz' }
    };

    expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
      expect(ex.forbidden).to.contain('Invalid immutableDoc document');
      expect(ex.forbidden).to.contain('properties of this document may not be modified');
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

function verifyDocumentReplaced() {
  verifyDocumentWriteAccepted('replace');
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
