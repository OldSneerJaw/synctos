var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/resources/test-immutable-sync-function.js').toString());

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('Immutable validation parameter', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  describe('array type validation', function() {
    it('can replace a document with an immutable array where the simple type elements have not changed', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };
      var oldDoc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced();
    });

    it('can replace a document with an immutable array where the nested array type elements have not changed', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [], null ]
      };
      var oldDoc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [], undefined ]
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced();
    });

    it('can create a document with an immutable array where the old document does not exist', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [] ]
      };

      syncFunction(doc);

      verifyDocumentCreated();
    });

    it('can create a document with an immutable array where the old document was deleted', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [] ]
      };
      var oldDoc = { _id: 'immutableDoc', _deleted: true };

      syncFunction(doc, oldDoc);

      verifyDocumentCreated();
    });

    it('can delete a document with an immutable array', function() {
      var doc = { _id: 'immutableDoc', _deleted: true };
      var oldDoc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted();
    });

    it('cannot replace a document with an immutable array where the elements are not equal', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ]
      };
      var oldDoc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [] ]
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid immutableDoc document');
        expect(ex.forbidden).to.contain('value of item "immutableArrayProp" may not be modified');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot replace a document with an immutable array where the one is a subset of the other', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };
      var oldDoc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [] ]
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid immutableDoc document');
        expect(ex.forbidden).to.contain('value of item "immutableArrayProp" may not be modified');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot replace a document with an immutable array where the element order has changed', function() {
      var doc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ [], 'foobar', 3, false, 45.9 ]
      };
      var oldDoc = {
        _id: 'immutableDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [] ]
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid immutableDoc document');
        expect(ex.forbidden).to.contain('value of item "immutableArrayProp" may not be modified');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });
  });
});

function verifyDocumentWriteAccepted(expectedChannel) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.contain(expectedChannel);

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
