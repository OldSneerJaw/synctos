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

function verifyDocumentCreated(doc, expectedChannels) {
  verifyDocumentAccepted(doc, undefined, expectedChannels || 'add');
}

function verifyDocumentReplaced(doc, oldDoc, expectedChannels) {
  verifyDocumentAccepted(doc, oldDoc, expectedChannels || 'replace');
}

function verifyDocumentDeleted(oldDoc, expectedChannels) {
  verifyDocumentAccepted({ _id: oldDoc._id, _deleted: true }, oldDoc, expectedChannels || 'remove');
}

function verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedChannels) {
  expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
    verifyValidationErrors(docType, expectedErrorMessages, ex);
  });

  verifyChannelAccess(expectedChannels);

  expect(channel.callCount).to.equal(0);
}

function verifyDocumentNotCreated(doc, docType, expectedErrorMessages, expectedChannels) {
  verifyDocumentRejected(doc, undefined, docType, expectedErrorMessages, expectedChannels || 'add');
}

function verifyDocumentNotReplaced(doc, oldDoc, docType, expectedErrorMessages, expectedChannels) {
  verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedChannels || 'replace');
}

function verifyDocumentNotDeleted(oldDoc, docType, expectedErrorMessages, expectedChannels) {
  verifyDocumentRejected({ _id: oldDoc._id, _deleted: true }, oldDoc, docType, expectedErrorMessages, expectedChannels || 'remove');
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
 * Attempts to create the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} doc The new document
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected. Set to "add" by default if not specified.
 */
exports.verifyDocumentCreated = verifyDocumentCreated;

/**
 * Attempts to replace the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} doc The updated document
 * @param {Object} oldDoc The document to replace
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected. Set to "replace" by default if not specified.
 */
exports.verifyDocumentReplaced = verifyDocumentReplaced;

/**
 * Attempts to delete the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} oldDoc The document to delete
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected. Set to "remove" by default if not specified.
 */
exports.verifyDocumentDeleted = verifyDocumentDeleted;

/**
 * Attempts to write the specified doc and then verifies that it failed validation with the expected channels.
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
 * Attempts to create the specified doc and then verifies that it failed validation with the expected channels.
 *
 * @param {Object} doc The new document
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected. Set to "add" by default if not specified.
 */
exports.verifyDocumentNotCreated = verifyDocumentNotCreated;

/**
 * Attempts to replace the specified doc and then verifies that it failed validation with the expected channels.
 *
 * @param {Object} doc The updated document
 * @param {Object} oldDoc The document to replace
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected. Set to "replace" by default if not specified.
 */
exports.verifyDocumentNotReplaced = verifyDocumentNotReplaced;

/**
 * Attempts to delete the specified doc and then verifies that it failed validation with the expected channels.
 *
 * @param {Object} oldDoc The document to delete
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected. Set to "remove" by default if not specified.
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
