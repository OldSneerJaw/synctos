var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');
var validationErrorFormatter = require('./validation-error-message-formatter.js');

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var requireRole;
var channel;
var access;

var syncFunction;

var defaultWriteChannel = 'write';

function init(syncFunctionPath) {
  // Load the contents of the sync function file into a global variable called syncFunction
  /*jslint evil: true */
  eval('syncFunction = ' + fs.readFileSync(syncFunctionPath).toString());
  /*jslint evil: false */

  requireAccess = simple.stub();
  requireRole = simple.stub();
  channel = simple.stub();
  access = simple.stub();
}

function verifyRequireAccess(expectedChannels) {
  expect(requireAccess.callCount).to.be(1);

  checkAuthorizations(expectedChannels, requireAccess.calls[0].arg, 'channel');
}

function verifyRequireRole(expectedRoles) {
  expect(requireRole.callCount).to.be(1);

  checkAuthorizations(expectedRoles, requireRole.calls[0].arg, 'role');
}

function verifyChannelAssignment(expectedChannels) {
  expect(channel.callCount).to.be(1);

  checkAuthorizations(expectedChannels, channel.calls[0].arg, 'channel');
}

function checkAuthorizations(expectedAuthorizations, actualAuthorizations, authorizationType) {
  if (!(expectedAuthorizations instanceof Array)) {
    expectedAuthorizations = [ expectedAuthorizations ];
  }

  if (!(actualAuthorizations instanceof Array)) {
    actualAuthorizations = [ actualAuthorizations ];
  }

  // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), ensure
  // that neither list of channels/roles/users contains an element that does not exist in the other
  for (var expectedAuthIndex = 0; expectedAuthIndex < expectedAuthorizations.length; expectedAuthIndex++) {
    var expectedAuth = expectedAuthorizations[expectedAuthIndex];
    if (actualAuthorizations.indexOf(expectedAuth) < 0) {
      expect().fail('Expected ' + authorizationType + ' was not encountered: ' + expectedAuth);
    }
  }

  for (var actualAuthIndex = 0; actualAuthIndex < actualAuthorizations.length; actualAuthIndex++) {
    var actualAuth = actualAuthorizations[actualAuthIndex];
    if (expectedAuthorizations.indexOf(actualAuth) < 0) {
      expect().fail('Unexpected ' + authorizationType + ' encountered: ' + actualAuth);
    }
  }
}

function areUnorderedListsEqual(list1, list2) {
  if (list1.length !== list2.length) {
    return false;
  }

  for (var setIndex = 0; setIndex < list1.length; setIndex++) {
    if (list2.indexOf(list1[setIndex]) < 0) {
      return false;
    } else if (list1.indexOf(list2[setIndex]) < 0) {
      return false;
    }
  }

  // If we got here, the two sets are equal
  return true;
}

function accessAssignmentCallExists(expectedUsersAndRoles, expectedChannels) {
  // Try to find an actual access assignment call that matches the expected call
  for (var accessCallIndex = 0; accessCallIndex < access.callCount; accessCallIndex++) {
    var accessCall = access.calls[accessCallIndex];
    if (areUnorderedListsEqual(accessCall.args[0], expectedUsersAndRoles) && areUnorderedListsEqual(accessCall.args[1], expectedChannels)) {
      return true;
    }
  }

  return false;
}

function verifyAccessAssignments(expectedAccessAssignments) {
  var assignmentIndex;
  for (assignmentIndex = 0; assignmentIndex < expectedAccessAssignments.length; assignmentIndex++) {
    var expectedAssignment = expectedAccessAssignments[assignmentIndex];

    var expectedUsersAndRoles = [ ];
    if (expectedAssignment.expectedUsers) {
      if (expectedAssignment.expectedUsers instanceof Array) {
        for (var userIndex = 0; userIndex < expectedAssignment.expectedUsers.length; userIndex++) {
          expectedUsersAndRoles.push(expectedAssignment.expectedUsers[userIndex]);
        }
      } else {
        expectedUsersAndRoles.push(expectedAssignment.expectedUsers);
      }
    }

    if (expectedAssignment.expectedRoles) {
      // The prefix "role:" must be applied to roles when calling the access function, as specified by
      // http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/channels/developing/index.html#programmatic-authorization
      if (expectedAssignment.expectedRoles instanceof Array) {
        for (var roleIndex = 0; roleIndex < expectedAssignment.expectedRoles.length; roleIndex++) {
          expectedUsersAndRoles.push('role:' + expectedAssignment.expectedRoles[roleIndex]);
        }
      } else {
        expectedUsersAndRoles.push('role:' + expectedAssignment.expectedRoles);
      }
    }

    var expectedChannels = [ ];
    if (expectedAssignment.expectedChannels) {
      if (expectedAssignment.expectedChannels instanceof Array) {
        for (var channelIndex = 0; channelIndex < expectedAssignment.expectedChannels.length; channelIndex++) {
          expectedChannels.push(expectedAssignment.expectedChannels[channelIndex]);
        }
      } else {
        expectedChannels.push(expectedAssignment.expectedChannels);
      }
    }

    if (!accessAssignmentCallExists(expectedUsersAndRoles, expectedChannels)) {
      expect().fail(
        'Missing expected call to assign channel access (' +
        JSON.stringify(expectedChannels) +
        ') to users and roles (' +
        JSON.stringify(expectedUsersAndRoles) +
        ')');
    }
  }

  if (access.callCount !== assignmentIndex) {
    expect().fail('Number of calls to assign channel access (' + access.callCount + ') does not match expected (' + assignmentIndex + ')');
  }
}

function verifyOperationChannelsAssigned(doc, oldDoc, expectedChannels) {
  if (channel.callCount !== 1) {
    expect().fail('Document failed authorization and/or validation');
  }

  var actualChannels = channel.calls[0].arg;
  if (expectedChannels instanceof Array) {
    for (var channelIndex = 0; channelIndex < expectedChannels.length; channelIndex++) {
      expect(actualChannels).to.contain(expectedChannels[channelIndex]);
    }
  } else {
    expect(actualChannels).to.contain(expectedChannels);
  }
}

function verifyAuthorization(expectedAuthorization) {
  var expectedOperationChannels = [ ];
  if (typeof(expectedAuthorization) === 'string' || expectedAuthorization instanceof Array) {
    // For backward compatibility, if the authorization parameter is not an object, treat it as the collection of channels that are required
    // for authorization
    expectedOperationChannels = expectedAuthorization;
    verifyRequireAccess(expectedAuthorization);
    expect(requireRole.callCount).to.be(0);
  } else {
    if (expectedAuthorization.expectedChannels) {
      expectedOperationChannels = expectedAuthorization.expectedChannels;
      verifyRequireAccess(expectedAuthorization.expectedChannels);
    } else {
      expect(requireAccess.callCount).to.be(0);
    }

    if (expectedAuthorization.expectedRoles) {
      verifyRequireRole(expectedAuthorization.expectedRoles);
    } else {
      expect(requireRole.callCount).to.be(0);
    }
  }

  return expectedOperationChannels;
}

function verifyDocumentAccepted(doc, oldDoc, expectedAuthorization, expectedAccessAssignments) {
  syncFunction(doc, oldDoc);

  if (expectedAccessAssignments) {
    verifyAccessAssignments(expectedAccessAssignments);
  }

  var expectedOperationChannels = verifyAuthorization(expectedAuthorization);

  verifyOperationChannelsAssigned(doc, oldDoc, expectedOperationChannels);
}

function verifyDocumentCreated(doc, expectedAuthorization, expectedAccessAssignments) {
  verifyDocumentAccepted(doc, undefined, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
}

function verifyDocumentReplaced(doc, oldDoc, expectedAuthorization, expectedAccessAssignments) {
  verifyDocumentAccepted(doc, oldDoc, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
}

function verifyDocumentDeleted(oldDoc, expectedAuthorization, expectedAccessAssignments) {
  verifyDocumentAccepted({ _id: oldDoc._id, _deleted: true }, oldDoc, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
}

function verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
  expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
    verifyValidationErrors(docType, expectedErrorMessages, ex);
  });

  verifyAuthorization(expectedAuthorization);

  expect(channel.callCount).to.equal(0);
}

function verifyDocumentNotCreated(doc, docType, expectedErrorMessages, expectedAuthorization) {
  verifyDocumentRejected(doc, undefined, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
}

function verifyDocumentNotReplaced(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
  verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
}

function verifyDocumentNotDeleted(oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
  verifyDocumentRejected({ _id: oldDoc._id, _deleted: true }, oldDoc, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
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

  for (var expectedErrorIndex = 0; expectedErrorIndex < expectedErrorMessages.length; expectedErrorIndex++) {
    expect(actualErrorMessages).to.contain(expectedErrorMessages[expectedErrorIndex]);
  }

  // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), ensure
  // that neither list of validation errors contains an element that does not exist in the other
  for (var actualErrorIndex = 0; actualErrorIndex < actualErrorMessages.length; actualErrorIndex++) {
    var errorMessage = actualErrorMessages[actualErrorIndex];
    if (expectedErrorMessages.indexOf(errorMessage) < 0) {
      expect().fail('Unexpected validation error: ' + errorMessage);
    }
  }
}

function verifyAccessDenied(doc, oldDoc, expectedAuthorization) {
  var channelAccessDenied = new Error('Channel access denied!');
  var roleAccessDenied = new Error('Role access denied!');
  var generalAuthFailedMessage = 'missing channel access';

  requireAccess = simple.stub().throwWith(channelAccessDenied);
  requireRole = simple.stub().throwWith(roleAccessDenied);

  expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
    if (typeof(expectedAuthorization) === 'string' || expectedAuthorization instanceof Array) {
      expect(ex).to.eql(channelAccessDenied);
    } else if (!(expectedAuthorization.expectedChannels) && !(expectedAuthorization.expectedRoles)) {
      expect(ex.forbidden).to.equal(generalAuthFailedMessage);
    } else if (expectedAuthorization.expectedChannels && expectedAuthorization.expectedRoles) {
      expect(ex.forbidden).to.equal(generalAuthFailedMessage);
    } else if (expectedAuthorization.expectedChannels && !(expectedAuthorization.expectedRoles)) {
      expect(ex).to.eql(channelAccessDenied);
    } else if (expectedAuthorization.expectedRoles && !(expectedAuthorization.expectedChannels)) {
      expect(ex).to.eql(roleAccessDenied);
    }
  });

  verifyAuthorization(expectedAuthorization);
}

function verifyUnknownDocumentType(doc, oldDoc) {
  expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
    expect(ex.forbidden).to.equal('Unknown document type');
  });

  expect(requireAccess.callCount).to.be(0);
  expect(channel.callCount).to.be(0);
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
 * @param {(Object|string[])} expectedAuthorization Either an object that specifies the separate channels/roles/users or a list of channels
 *                                                  that are required to perform the operation. If it is an object, the following fields are
 *                                                  available:
 *                                                  - expectedChannels: an optional list of channels that are required
 *                                                  - expectedRoles: an optional list of roles that are required
 * @param {Object[]} [expectedAccessAssignments] An optional list of expected user and role channel assignments. Each entry is an object
 *                                               that contains the following fields:
 *                                               - expectedChannels: an optional list of channels to assign to the users and roles
 *                                               - expectedUsers: an optional list of users to which to assign the channels
 *                                               - expectedRoles: an optional list of roles to which to assign the channels
 */
exports.verifyDocumentAccepted = verifyDocumentAccepted;

/**
 * Attempts to create the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} doc The new document
 * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the channels/roles/users or an optional list
 *                                                    of channels that are required to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are required
 *                                                    - expectedRoles: an optional list of roles that are required
 * @param {Object[]} [expectedAccessAssignments] An optional list of expected user and role channel assignments. Each entry is an object
 *                                               that contains the following fields:
 *                                               - expectedChannels: an optional list of channels to assign to the users and roles
 *                                               - expectedUsers: an optional list of users to which to assign the channels
 *                                               - expectedRoles: an optional list of roles to which to assign the channels
 */
exports.verifyDocumentCreated = verifyDocumentCreated;

/**
 * Attempts to replace the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} doc The updated document
 * @param {Object} oldDoc The document to replace
 * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the channels/roles/users or an optional list
 *                                                    of channels that are required to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are required
 *                                                    - expectedRoles: an optional list of roles that are required
 * @param {Object[]} [expectedAccessAssignments] An optional list of expected user and role channel assignments. Each entry is an object
 *                                               that contains the following fields:
 *                                               - expectedChannels: an optional list of channels to assign to the users and roles
 *                                               - expectedUsers: an optional list of users to which to assign the channels
 *                                               - expectedRoles: an optional list of roles to which to assign the channels
 */
exports.verifyDocumentReplaced = verifyDocumentReplaced;

/**
 * Attempts to delete the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} oldDoc The document to delete
 * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the channels/roles/users or an optional list
 *                                                    of channels that are required to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are required
 *                                                    - expectedRoles: an optional list of roles that are required
 * @param {Object[]} [expectedAccessAssignments] An optional list of expected user and role channel assignments. Each entry is an object
 *                                               that contains the following fields:
 *                                               - expectedChannels: an optional list of channels to assign to the users and roles
 *                                               - expectedUsers: an optional list of users to which to assign the channels
 *                                               - expectedRoles: an optional list of roles to which to assign the channels
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
 * @param {(Object|string[])} expectedAuthorization Either an object that specifies the separate channels/roles/users or a list of channels
 *                                                  that are required to perform the operation. If it is an object, the following fields are
 *                                                  available:
 *                                                  - expectedChannels: an optional list of channels that are required
 *                                                  - expectedRoles: an optional list of roles that are required
 */
exports.verifyDocumentRejected = verifyDocumentRejected;

/**
 * Attempts to create the specified doc and then verifies that it failed validation with the expected channels.
 *
 * @param {Object} doc The new document
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the channels/roles/users or an optional list
 *                                                    of channels that are required to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are required
 *                                                    - expectedRoles: an optional list of roles that are required
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
 * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the channels/roles/users or an optional list
 *                                                    of channels that are required to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are required
 *                                                    - expectedRoles: an optional list of roles that are required
 */
exports.verifyDocumentNotReplaced = verifyDocumentNotReplaced;

/**
 * Attempts to delete the specified doc and then verifies that it failed validation with the expected channels.
 *
 * @param {Object} oldDoc The document to delete
 * @param {string} docType The document's type as specified in the document definition
 * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
 *                                         if only one validation error is expected.
 * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the channels/roles/users or an optional list
 *                                                    of channels that are required to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are required
 *                                                    - expectedRoles: an optional list of roles that are required
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

/**
 * Verifies that the specified document that was created, replaced or deleted required the specified channels for access.
 *
 * @param {string[]} expectedChannels The list of channels that are required to perform the operation. May be a string if only one channel
 *                                    is expected.
 */
exports.verifyRequireAccess = verifyRequireAccess;

/**
 * Verifies that the specified document that was created, replaced or deleted required the specified roles for access.
 *
 * @param {string[]} expectedRoles The list of roles that are required to perform the operation. May be a string if only one role is
 *                                 expected.
 */
exports.verifyRequireRole = verifyRequireRole;

/**
 * Verifies that the specified channels were all assigned to a document that was created, replaced or deleted.
 *
 * @param {string[]} expectedChannels The list of channels that should have been assigned to the document. May be a string if only one
 *                                    channel is expected.
 */
exports.verifyChannelAssignment = verifyChannelAssignment;

/**
 * Verifies that the sync function throws an error when authorization is denied to create/replace/delete a document.
 *
 * @param {Object} doc The document to attempt to write. May include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 * @param {(Object|string[])} expectedAuthorization Either an object that specifies the separate channels/roles/users or a list of channels
 *                                                  that are required to perform the operation. If it is an object, the following fields are
 *                                                  available:
 *                                                  - expectedChannels: an optional list of channels that are required
 *                                                  - expectedRoles: an optional list of roles that are required
 */
exports.verifyAccessDenied = verifyAccessDenied;

/**
 * Verifies that the given document's type is unknown/invalid.
 *
 * @param {Object} doc The document to attempt to write. May include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 */
exports.verifyUnknownDocumentType = verifyUnknownDocumentType;

/**
 * An object that contains functions that are used to format expected validation error messages in specifications. Documentation can be
 * found in the "validation-error-message-formatter" module.
 */
exports.validationErrorFormatter = validationErrorFormatter;
