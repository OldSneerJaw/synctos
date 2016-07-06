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
  if (!(expectedErrorMessages instanceof Array)) {
    expectedErrorMessages = [ expectedErrorMessages ];
  }

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

/**
 * Initializes the module with the sync function at the specified file path.
 *
 * @param {string} syncFunctionPath The path to the sync function to load
 */
exports.init = init;

/**
 * Attempts to write the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} doc The document to write. May include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected.
 */
exports.verifyDocumentAccepted = verifyDocumentAccepted;

/**
 * Attempts to create the specified doc and then verifies that it completed successfully with the "add" channel.
 *
 * @param {Object} doc The new document
 * @param {Object} oldDoc The document to replace, if any. Should be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 */
exports.verifyDocumentCreated = verifyDocumentCreated;

/**
 * Attempts to replace the specified doc and then verifies that it completed successfully with the "replace" channel.
 *
 * @param {Object} doc The updated document
 * @param {Object} oldDoc The document to replace
 */
exports.verifyDocumentReplaced = verifyDocumentReplaced;

/**
 * Attempts to delete the specified doc and then verifies that it completed successfully with the "remove" channel.
 *
 * @param {Object} doc The deleted document. Should include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to delete
 */
exports.verifyDocumentDeleted = verifyDocumentDeleted;

/**
 * Attempts to write the specified doc and then verifies that it failed validation.
 *
 * @param {Object} doc The document to write. May include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected.
 */
exports.verifyDocumentRejected = verifyDocumentRejected;

/**
 * Attempts to create the specified doc and then verifies that it failed validation with the "add" channel.
 *
 * @param {Object} doc The new document
 * @param {Object} oldDoc The document to replace, if any. Should be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 */
exports.verifyDocumentNotCreated = verifyDocumentNotCreated;

/**
 * Attempts to replace the specified doc and then verifies that it failed validation with the "replace" channel.
 *
 * @param {Object} doc The updated document
 * @param {Object} oldDoc The document to replace
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 */
exports.verifyDocumentNotReplaced = verifyDocumentNotReplaced;

/**
 * Attempts to delete the specified doc and then verifies that it failed validation with the "remove" channel.
 *
 * @param {Object} doc The document to delete. Should include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to delete
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 */
exports.verifyDocumentNotDeleted = verifyDocumentNotDeleted;

/**
 * Verifies that the given exception result of a document write operation includes the specified validation error messages.
 *
 * @param {Object} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be contained in the exception. May be a string
 *                                         if only one validation error is expected.
 * @param {Object} exception The exception that was thrown by the sync function. Should include a "forbidden" property of type string.
 */
exports.verifyValidationErrors = verifyValidationErrors;
