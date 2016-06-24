var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/resources/test-date-sync-function.js').toString());

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('Date validation type', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  describe('range validation', function() {
    it('can create a doc with a date that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-23'
      };

      syncFunction(doc);

      verifyDocumentCreated();
    });

    it('cannot create a doc with a date that is before the minimum value', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-22'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid dateDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationProp" must not be less than 2016-06-23');
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date that is after than the maximum value', function() {
      var doc = {
        _id: 'dateDoc',
        rangeValidationProp: '2016-06-24'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid dateDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationProp" must not be greater than 2016-06-23');
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
