const expect = require('expect.js');
const simple = require('simple-mock');
const fs = require('fs');

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

var syncFunction;

function init(syncFunctionPath) {
  // Load the contents of the sync function file into a global variable called syncFunction
  eval('syncFunction = ' + fs.readFileSync(syncFunctionPath).toString());
  requireAccess = simple.stub();
  channel = simple.stub();
}

function verifyChannelAccess(expectedChannels) {
  expect(requireAccess.callCount).to.equal(1);
  var actualChannels = requireAccess.calls[0].arg;
  if (expectedChannels instanceof Array && actualChannels instanceof Array) {
    expect(actualChannels.length).to.equal(expectedChannels.length);
    for (var channelIndex = 0; channelIndex < expectedChannels.length; channelIndex++) {
      expect(actualChannels).to.contain(expectedChannels[channelIndex]);
    }
  } else {
    expect(actualChannels).to.equal(expectedChannels);
  }
}

function verifyDocumentAccepted(doc, oldDoc, expectedChannels) {
  syncFunction(doc, oldDoc);

  verifyChannelAccess(expectedChannels);

  expect(channel.callCount).to.equal(1);

  var actualChannels = channel.calls[0].arg;
  if (expectedChannels instanceof Array && actualChannels instanceof Array) {
    for (var channelIndex = 0; channelIndex < expectedChannels.length; channelIndex++) {
      expect(actualChannels).to.contain(expectedChannels[channelIndex]);
    }
  } else {
    expect(actualChannels).to.contain(expectedChannels);
  }
}

function verifyDocumentCreated(doc, oldDoc) {
  verifyDocumentAccepted(doc, oldDoc, 'add');
}

function verifyDocumentReplaced(doc, oldDoc) {
  verifyDocumentAccepted(doc, oldDoc, 'replace');
}

function verifyDocumentDeleted(doc, oldDoc) {
  verifyDocumentAccepted(doc, oldDoc, 'remove');
}

function verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedChannels) {
  expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
    verifyValidationErrors(docType, expectedErrorMessages, ex);
  });

  verifyChannelAccess(expectedChannels);

  expect(channel.callCount).to.equal(0);
}

function verifyDocumentNotCreated(doc, oldDoc, docType, expectedErrorMessages) {
  verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, 'add');
}

function verifyDocumentNotReplaced(doc, oldDoc, docType, expectedErrorMessages) {
  verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, 'replace');
}

function verifyDocumentNotDeleted(doc, oldDoc, docType, expectedErrorMessages) {
  verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, 'remove');
}

function verifyValidationErrors(docType, expectedErrorMessages, exception) {
  // Used to split the leading component (e.g. "Invalid foobar document") from the validation error messages, which are separated by a colon
  var validationErrorRegex = /^([^:]+):\s*(.+)$/;

  var exceptionMessageMatches = validationErrorRegex.exec(exception.forbidden);
  expect(exceptionMessageMatches.length).to.be(3);

  var invalidDocMessage = exceptionMessageMatches[1].trim();
  expect(invalidDocMessage).to.equal('Invalid ' + docType + ' document');

  var actualErrorMessages = exceptionMessageMatches[2].trim().split(/;\s*/);
  expect(expectedErrorMessages.length).to.equal(actualErrorMessages.length);

  for (var errorIndex = 0; errorIndex < expectedErrorMessages.length; errorIndex++) {
    var expectedError = expectedErrorMessages[errorIndex];
    expect(actualErrorMessages).to.contain(expectedError);
  }
}

exports.init = init;
exports.verifyDocumentAccepted = verifyDocumentAccepted;
exports.verifyDocumentCreated = verifyDocumentCreated;
exports.verifyDocumentReplaced = verifyDocumentReplaced;
exports.verifyDocumentDeleted = verifyDocumentDeleted;
exports.verifyDocumentRejected = verifyDocumentRejected;
exports.verifyDocumentNotCreated = verifyDocumentNotCreated;
exports.verifyDocumentNotReplaced = verifyDocumentNotReplaced;
exports.verifyDocumentNotDeleted = verifyDocumentNotDeleted;
exports.verifyValidationErrors = verifyValidationErrors;
