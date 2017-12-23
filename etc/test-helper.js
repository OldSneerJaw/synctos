var validationErrorFormatter = require('./validation-error-message-formatter.js');

/**
 * An object that contains functions that are used to format expected validation error messages in specifications. Documentation can be
 * found in the "validation-error-message-formatter" module.
 */
exports.validationErrorFormatter = validationErrorFormatter;

/**
 * Initializes the module with the sync function at the specified file path.
 *
 * @param {string} filePath The path to the sync function to load
 */
exports.initSyncFunction = initSyncFunction;

/**
 * Initializes the test helper module with the document definitions at the specified file path.
 *
 * @param {string} filePath The path to the document definitions to load
 */
exports.initDocumentDefinitions = initDocumentDefinitions;

/**
 * DEPRECATED. Use initSyncFunction instead.
 */
exports.init = initSyncFunction;

/**
 * Attempts to write the specified doc and then verifies that it completed successfully with the expected channels.
 *
 * @param {Object} doc The document to write. May include property "_deleted=true" to simulate a delete operation.
 * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
 *                        create operation.
 * @param {(Object|string[])} expectedAuthorization Either an object that specifies the separate channels/roles/users or a list of channels
 *                                                  that are authorized to perform the operation. If it is an object, the following fields are
 *                                                  available:
 *                                                  - expectedChannels: an optional list of channels that are authorized
 *                                                  - expectedRoles: an optional list of roles that are authorized
 *                                                  - expectedUsers: an optional list of users that are authorized
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
 *                                                    of channels that are authorized to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are authorized
 *                                                    - expectedRoles: an optional list of roles that are authorized
 *                                                    - expectedUsers: an optional list of users that are authorized
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
 *                                                    of channels that are authorized to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are authorized
 *                                                    - expectedRoles: an optional list of roles that are authorized
 *                                                    - expectedUsers: an optional list of users that are authorized
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
 *                                                    of channels that are authorized to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are authorized
 *                                                    - expectedRoles: an optional list of roles that are authorized
 *                                                    - expectedUsers: an optional list of users that are authorized
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
 *                                                  that are authorized to perform the operation. If it is an object, the following fields are
 *                                                  available:
 *                                                  - expectedChannels: an optional list of channels that are authorized
 *                                                  - expectedRoles: an optional list of roles that are authorized
 *                                                  - expectedUsers: an optional list of users that are authorized
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
 *                                                    of channels that are authorized to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are authorized
 *                                                    - expectedRoles: an optional list of roles that are authorized
 *                                                    - expectedUsers: an optional list of users that are authorized
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
 *                                                    of channels that are authorized to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are authorized
 *                                                    - expectedRoles: an optional list of roles that are authorized
 *                                                    - expectedUsers: an optional list of users that are authorized
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
 *                                                    of channels that are authorized to perform the operation. If omitted, then the channel
 *                                                    "write" is assumed. If it is an object, the following fields are available:
 *                                                    - expectedChannels: an optional list of channels that are authorized
 *                                                    - expectedRoles: an optional list of roles that are authorized
 *                                                    - expectedUsers: an optional list of users that are authorized
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
 * @param {string[]} expectedChannels The list of all channels that are authorized to perform the operation. May be a string if only one channel
 *                                    is expected.
 */
exports.verifyRequireAccess = verifyRequireAccess;

/**
 * Verifies that the specified document that was created, replaced or deleted required the specified roles for access.
 *
 * @param {string[]} expectedRoles The list of all roles that are authorized to perform the operation. May be a string if only one role is
 *                                 expected.
 */
exports.verifyRequireRole = verifyRequireRole;

/**
 * Verifies that the specified document that was created, replaced or deleted required the specified users for access.
 *
 * @param {string[]} expectedUsers The list of all users that are authorized to perform the operation. May be a string if only one user is
 *                                 expected.
 */
exports.verifyRequireUser = verifyRequireUser;

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
 *                                                  that are authorized to perform the operation. If it is an object, the following fields are
 *                                                  available:
 *                                                  - expectedChannels: an optional list of channels that are authorized
 *                                                  - expectedRoles: an optional list of roles that are authorized
 *                                                  - expectedUsers: an optional list of users that are authorized
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

var assert = require('assert');
var simple = require('simple-mock');
var fs = require('fs');
var syncFunctionLoader = require('./sync-function-loader.js');

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var requireRole;
var requireUser;
var channel;
var access;
var role;

var syncFunction;

// A function stub that can be used in document definitions for test cases to verify custom actions
var customActionStub;

var defaultWriteChannel = 'write';

function initSyncFunction(filePath) {
  // Load the contents of the sync function file into a global variable called syncFunction
  var rawSyncFunction = fs.readFileSync(filePath).toString();

  /*jslint evil: true */
  eval('syncFunction = ' + unescapeBackticks(rawSyncFunction));
  /*jslint evil: false */

  init();
}

function initDocumentDefinitions(filePath) {
  // Generate a sync function from the document definitions and load its contents into a global variable called syncFunction
  var rawDocDefinitions = syncFunctionLoader.load(filePath);

  /*jslint evil: true */
  eval('syncFunction = ' + unescapeBackticks(rawDocDefinitions));
  /*jslint evil: false */

  init();
}

function init() {
  exports.syncFunction = syncFunction;

  exports.requireAccess = requireAccess = simple.stub();
  exports.requireRole = requireRole = simple.stub();
  exports.requireUser = requireUser = simple.stub();
  exports.channel = channel = simple.stub();
  exports.access = access = simple.stub();
  exports.role = role = simple.stub();

  exports.customActionStub = customActionStub = simple.stub();
}

function verifyRequireAccess(expectedChannels) {
  assert.ok(requireAccess.callCount > 0, 'Require access not called when expected');

  checkAuthorizations(expectedChannels, requireAccess.calls[0].arg, 'channel');
}

function verifyRequireRole(expectedRoles) {
  assert.ok(requireRole.callCount > 0, 'Require role not called when expected');

  checkAuthorizations(expectedRoles, requireRole.calls[0].arg, 'role');
}

function verifyRequireUser(expectedUsers) {
  assert.ok(requireUser.callCount > 0, 'Require user not called when expected');

  checkAuthorizations(expectedUsers, requireUser.calls[0].arg, 'user');
}

function verifyChannelAssignment(expectedChannels) {
  assert.equal(channel.callCount, 1, 'Expected channel assignment was not made');

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
      assert.fail('Expected ' + authorizationType + ' was not encountered: ' + expectedAuth);
    }
  }

  for (var actualAuthIndex = 0; actualAuthIndex < actualAuthorizations.length; actualAuthIndex++) {
    var actualAuth = actualAuthorizations[actualAuthIndex];
    if (expectedAuthorizations.indexOf(actualAuth) < 0) {
      assert.fail('Unexpected ' + authorizationType + ' encountered: ' + actualAuth);
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

function accessAssignmentCallExists(accessFunction, expectedParam1, expectedParam2) {
  // Try to find an actual channel/role access assignment call that matches the expected call
  for (var accessCallIndex = 0; accessCallIndex < accessFunction.callCount; accessCallIndex++) {
    var accessCall = accessFunction.calls[accessCallIndex];
    if (areUnorderedListsEqual(accessCall.args[0], expectedParam1) && areUnorderedListsEqual(accessCall.args[1], expectedParam2)) {
      return true;
    }
  }

  return false;
}

function prefixRoleName(role) {
  return 'role:' + role;
}

function verifyChannelAccessAssignment(expectedAssignment) {
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
    // http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#access-username-channelname
    if (expectedAssignment.expectedRoles instanceof Array) {
      for (var roleIndex = 0; roleIndex < expectedAssignment.expectedRoles.length; roleIndex++) {
        expectedUsersAndRoles.push(prefixRoleName(expectedAssignment.expectedRoles[roleIndex]));
      }
    } else {
      expectedUsersAndRoles.push(prefixRoleName(expectedAssignment.expectedRoles));
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

  if (!accessAssignmentCallExists(access, expectedUsersAndRoles, expectedChannels)) {
    assert.fail(
      'Missing expected call to assign channel access (' +
      JSON.stringify(expectedChannels) +
      ') to users and roles (' +
      JSON.stringify(expectedUsersAndRoles) +
      ')');
  }
}

function verifyRoleAccessAssignment(expectedAssignment) {
  var expectedUsers = [ ];
  if (expectedAssignment.expectedUsers) {
    if (expectedAssignment.expectedUsers instanceof Array) {
      expectedUsers = expectedAssignment.expectedUsers;
    } else {
      expectedUsers.push(expectedAssignment.expectedUsers);
    }
  }

  var expectedRoles = [ ];
  if (expectedAssignment.expectedRoles) {
    // The prefix "role:" must be applied to roles when calling the role function, as specified by
    // http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#role-username-rolename
    if (expectedAssignment.expectedRoles instanceof Array) {
      for (var roleIndex = 0; roleIndex < expectedAssignment.expectedRoles.length; roleIndex++) {
        expectedRoles.push(prefixRoleName(expectedAssignment.expectedRoles[roleIndex]));
      }
    } else {
      expectedRoles.push(prefixRoleName(expectedAssignment.expectedRoles));
    }
  }

  if (!accessAssignmentCallExists(role, expectedUsers, expectedRoles)) {
    assert.fail(
      'Missing expected call to assign role access (' +
      JSON.stringify(expectedRoles) +
      ') to users (' +
      JSON.stringify(expectedUsers) +
      ')');
  }
}

function verifyAccessAssignments(expectedAccessAssignments) {
  var expectedAccessCalls = 0;
  var expectedRoleCalls = 0;
  for (var assignmentIndex = 0; assignmentIndex < expectedAccessAssignments.length; assignmentIndex++) {
    var expectedAssignment = expectedAccessAssignments[assignmentIndex];

    if (expectedAssignment.expectedType === 'role') {
      verifyRoleAccessAssignment(expectedAssignment);
      expectedRoleCalls++;
    } else if (expectedAssignment.expectedType === 'channel' || !(expectedAssignment.expectedType)) {
      verifyChannelAccessAssignment(expectedAssignment);
      expectedAccessCalls++;
    }
  }

  if (access.callCount !== expectedAccessCalls) {
    assert.fail('Number of calls to assign channel access (' + access.callCount + ') does not match expected (' + expectedAccessCalls + ')');
  }

  if (role.callCount !== expectedRoleCalls) {
    assert.fail('Number of calls to assign role access (' + role.callCount + ') does not match expected (' + expectedRoleCalls + ')');
  }
}

function verifyOperationChannelsAssigned(doc, oldDoc, expectedChannels) {
  if (channel.callCount !== 1) {
    assert.fail('Document failed authorization and/or validation');
  }

  var actualChannels = channel.calls[0].arg;
  if (expectedChannels instanceof Array) {
    for (var channelIndex = 0; channelIndex < expectedChannels.length; channelIndex++) {
      assert.ok(actualChannels.indexOf(expectedChannels[channelIndex]) >= 0, 'Expected channel "' + expectedChannels[channelIndex] + '" was not authorized');
    }
  } else {
    assert.ok(actualChannels.indexOf(expectedChannels) >= 0, 'Expected assignment channel not found: "' + expectedChannels + '" actual: "' + actualChannels + '"');
  }
}

function verifyAuthorization(expectedAuthorization) {
  var expectedOperationChannels = [ ];
  if (typeof(expectedAuthorization) === 'string' || expectedAuthorization instanceof Array) {
    // For backward compatibility, if the authorization parameter is not an object, treat it as the collection of channels that are required
    // for authorization
    expectedOperationChannels = expectedAuthorization;
    verifyRequireAccess(expectedAuthorization);
    assert.equal(requireRole.callCount, 0, 'Require role called unexpectedly: ' + requireRole.calls);
    assert.equal(requireUser.callCount, 0, 'Require user called unexpectedly: ' + requireUser.calls);
  } else {
    if (expectedAuthorization.expectedChannels) {
      expectedOperationChannels = expectedAuthorization.expectedChannels;
      verifyRequireAccess(expectedAuthorization.expectedChannels);
    }

    if (expectedAuthorization.expectedRoles) {
      verifyRequireRole(expectedAuthorization.expectedRoles);
    } else {
      assert.equal(requireRole.callCount, 0, 'Require role called unexpectedly: ' + requireRole.calls);
    }

    if (expectedAuthorization.expectedUsers) {
      verifyRequireUser(expectedAuthorization.expectedUsers);
    } else {
      assert.equal(requireUser.callCount, 0, 'Require user called unexpectedly: ' + requireUser.calls);
    }

    if (!(expectedAuthorization.expectedChannels) && !(expectedAuthorization.expectedRoles) && !(expectedAuthorization.expectedUsers)) {
      verifyRequireAccess([ ]);
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
  try {
    syncFunction(doc, oldDoc);
    assert.fail('No errors thrown when some expected');
  } catch (ex) {
    verifyValidationErrors(docType, expectedErrorMessages, ex);
  }

  verifyAuthorization(expectedAuthorization);

  assert.equal(channel.callCount, 0, 'Channel assignment made unexpectedly: ' + channel.calls);
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
  var actualErrorMessages;
  if (exceptionMessageMatches) {
    assert.equal(exceptionMessageMatches.length, 3);

    var invalidDocMessage = exceptionMessageMatches[1].trim();
    assert.equal(invalidDocMessage, 'Invalid ' + docType + ' document', 'Expected invalid document type message not reported');

    actualErrorMessages = exceptionMessageMatches[2].trim().split(/;\s*/);
  } else {
    actualErrorMessages = [ exception.forbidden ];
  }

  for (var expectedErrorIndex = 0; expectedErrorIndex < expectedErrorMessages.length; expectedErrorIndex++) {
    var expectedErrorMsg = expectedErrorMessages[expectedErrorIndex];
    assert.ok(actualErrorMessages.indexOf(expectedErrorMsg) >= 0, 'Expected error message "' + expectedErrorMsg  +'" not reported');
  }

  // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), ensure
  // that neither list of validation errors contains an element that does not exist in the other
  for (var actualErrorIndex = 0; actualErrorIndex < actualErrorMessages.length; actualErrorIndex++) {
    var errorMessage = actualErrorMessages[actualErrorIndex];
    if (expectedErrorMessages.indexOf(errorMessage) < 0) {
      assert.fail('Unexpected validation error: ' + errorMessage);
    }
  }
}

function countAuthorizationTypes(expectedAuthorization) {
  var count = 0;
  if (expectedAuthorization.expectedChannels) {
    count++;
  }
  if (expectedAuthorization.expectedRoles) {
    count++;
  }
  if (expectedAuthorization.expectedUsers) {
    count++;
  }

  return count;
}

function verifyAccessDenied(doc, oldDoc, expectedAuthorization) {
  var channelAccessDenied = new Error('Channel access denied!');
  var roleAccessDenied = new Error('Role access denied!');
  var userAccessDenied = new Error('User access denied!');
  var generalAuthFailedMessage = 'missing channel access';

  requireAccess = simple.stub().throwWith(channelAccessDenied);
  requireRole = simple.stub().throwWith(roleAccessDenied);
  requireUser = simple.stub().throwWith(userAccessDenied);

  try {
    syncFunction(doc, oldDoc);
    assert.fail('No errors thrown when some expected');
  } catch (ex) {
    if (typeof(expectedAuthorization) === 'string' || expectedAuthorization instanceof Array) {
      assert.equal(ex, channelAccessDenied);
    } else if (countAuthorizationTypes(expectedAuthorization) === 0) {
      verifyRequireAccess([ ]);
    } else if (countAuthorizationTypes(expectedAuthorization) > 1) {
      assert.equal(ex.forbidden, generalAuthFailedMessage, 'Expected authorization exception not met: ' + ex.forbidden);
    } else if (expectedAuthorization.expectedChannels) {
      assert.equal(ex, channelAccessDenied, 'Expected channel authorization error not triggered, got this instead: ' + ex);
    } else if (expectedAuthorization.expectedRoles) {
      assert.equal(ex, roleAccessDenied, 'Expected role authorization error not triggered, got this instead: ' + ex);
    } else if (expectedAuthorization.expectedUsers) {
      assert.equal(ex, userAccessDenied, 'Expected user authorization error not triggered, got this instead: ' + ex);
    }
  }

  verifyAuthorization(expectedAuthorization);
}

function verifyUnknownDocumentType(doc, oldDoc) {
  try {
    syncFunction(doc, oldDoc);
    assert.fail('Expected unknown document type error not thrown');
  } catch (ex) {
    assert.equal(ex.forbidden, 'Unknown document type');
  }

  assert.equal(requireAccess.callCount, 0, 'Unexpected require access call');
  assert.equal(channel.callCount, 0, 'Unexpected channel assignment call');
}

// Sync Gateway configuration files use the backtick character to denote the beginning and end of a multiline string. The sync function
// generator script automatically escapes backtick characters with the sequence "\`" so that it produces a valid multiline string.
// However, when loaded by the test helper, a sync function is not inserted into a Sync Gateway configuration file so we must "unescape"
// backtick characters to preserve the original intention.
function unescapeBackticks(originalString) {
  return originalString.replace(/\\`/g, function() { return '`'; });
}
