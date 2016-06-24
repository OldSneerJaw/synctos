var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/resources/test-array-sync-function.js').toString());

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('Array validation type', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  describe('length validation', function() {
    it('can create a doc with an array that is within the minimum and maximum lengths', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo', 'bar' ]
      };

      syncFunction(doc);

      verifyDocumentCreated();
    });

    it('cannot create a doc with an array that is shorter than the minimum length', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo' ]
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid arrayDoc document');
        expect(ex.forbidden).to.contain('length of item "lengthValidationProp" must not be less than 2');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with an array that is longer than the maximum length', function() {
      var doc = {
        _id: 'arrayDoc',
        lengthValidationProp: [ 'foo', 'bar', 'baz' ]
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid arrayDoc document');
        expect(ex.forbidden).to.contain('length of item "lengthValidationProp" must not be greater than 2');
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

function verifyDocumentWriteDenied() {
  expect(requireAccess.callCount).to.equal(1);
  expect(channel.callCount).to.equal(0);
}

function numberOfValidationErrors(message) {
  return message.split(';').length;
}
