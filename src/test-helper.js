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
 * An object that contains functions that are used to format expected validation error messages in specifications. Documentation can be
 * found in the "validation-error-message-formatter" module.
 */
exports.validationErrorFormatter = require('./validation-error-message-formatter.js');

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
var fs = require('fs');
var syncFunctionLoader = require('./sync-function-loader.js');
var testEnvironmentMaker = require('./test-environment-maker.js');

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
  var rawSyncFunction = fs.readFileSync(filePath).toString();

  init(rawSyncFunction, filePath);
}

function initDocumentDefinitions(filePath) {
  var rawSyncFunction = syncFunctionLoader.load(filePath);

  init(rawSyncFunction);
}

function init(rawSyncFunction, syncFunctionFile) {
  var testHelperEnvironment = testEnvironmentMaker.init(rawSyncFunction, syncFunctionFile);

  exports.requireAccess = requireAccess = testHelperEnvironment.requireAccess;
  exports.requireRole = requireRole = testHelperEnvironment.requireRole;
  exports.requireUser = requireUser = testHelperEnvironment.requireUser;
  exports.channel = channel = testHelperEnvironment.channel;
  exports.access = access = testHelperEnvironment.access;
  exports.role = role = testHelperEnvironment.role;

  exports.customActionStub = customActionStub = testHelperEnvironment.customActionStub;

  exports.syncFunction = syncFunction = testHelperEnvironment.syncFunction;
}

function verifyRequireAccess(expectedChannels) {
  assert.ok(requireAccess.callCount > 0, 'Document does not specify required channels. Expected: ' + expectedChannels);

  checkAuthorizations(expectedChannels, requireAccess.calls[0].arg, 'channel');
}

function verifyRequireRole(expectedRoles) {
  assert.ok(requireRole.callCount > 0, 'Document does not specify required roles. Expected: ' + expectedRoles);

  checkAuthorizations(expectedRoles, requireRole.calls[0].arg, 'role');
}

function verifyRequireUser(expectedUsers) {
  assert.ok(requireUser.callCount > 0, 'Document does not specify required users. Expected: ' + expectedUsers);

  checkAuthorizations(expectedUsers, requireUser.calls[0].arg, 'user');
}

function verifyChannelAssignment(expectedChannels) {
  assert.equal(channel.callCount, 1, 'Document was not assigned to any channels. Expected: ' + expectedChannels);

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
    } else if (expectedAssignment.expectedType === 'channel' || !expectedAssignment.expectedType) {
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
      assert.ok(
        actualChannels.indexOf(expectedChannels[channelIndex]) >= 0,
        'Document was not assigned to expected channel: ' + expectedChannels[channelIndex] + '. Actual: ' + actualChannels);
    }
  } else {
     assert.ok(
      actualChannels.indexOf(expectedChannels) >= 0,
      'Document was not assigned to expected channel: "' + expectedChannels + '. Actual: ' + actualChannels);
  }
}

function verifyAuthorization(expectedAuthorization) {
  var expectedOperationChannels = [ ];
  if (typeof expectedAuthorization === 'string' || expectedAuthorization instanceof Array) {
    // For backward compatibility, if the authorization parameter is not an object, treat it as the collection of channels that are required
    // for authorization
    expectedOperationChannels = expectedAuthorization;
    verifyRequireAccess(expectedAuthorization);
    assert.equal(requireRole.callCount, 0, 'Unexpected document roles assigned: ' + JSON.stringify(requireRole.calls));
    assert.equal(requireUser.callCount, 0, 'Unexpected document users assigned: ' + JSON.stringify(requireUser.calls));
  } else {
    if (expectedAuthorization.expectedChannels) {
      expectedOperationChannels = expectedAuthorization.expectedChannels;
      verifyRequireAccess(expectedAuthorization.expectedChannels);
    }

    if (expectedAuthorization.expectedRoles) {
      verifyRequireRole(expectedAuthorization.expectedRoles);
    } else {
      assert.equal(requireRole.callCount, 0, 'Unexpected document roles assigned: ' + JSON.stringify(requireRole.calls));
    }

    if (expectedAuthorization.expectedUsers) {
      verifyRequireUser(expectedAuthorization.expectedUsers);
    } else {
      assert.equal(requireUser.callCount, 0, 'Unexpected document users assigned: ' + JSON.stringify(requireUser.calls));
    }

    if (!expectedAuthorization.expectedChannels && !expectedAuthorization.expectedRoles && !expectedAuthorization.expectedUsers) {
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
  verifyDocumentAccepted(doc, void 0, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
}

function verifyDocumentReplaced(doc, oldDoc, expectedAuthorization, expectedAccessAssignments) {
  verifyDocumentAccepted(doc, oldDoc, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
}

function verifyDocumentDeleted(oldDoc, expectedAuthorization, expectedAccessAssignments) {
  verifyDocumentAccepted({ _id: oldDoc._id, _deleted: true }, oldDoc, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
}

function verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
  var syncFuncError = null;
  try {
    syncFunction(doc, oldDoc);
  } catch (ex) {
    syncFuncError = ex;
  }

  if (syncFuncError) {
    verifyValidationErrors(docType, expectedErrorMessages, syncFuncError);
    verifyAuthorization(expectedAuthorization);

    assert.equal(channel.callCount, 0, 'Document was erroneously assigned to channels: ' + JSON.stringify(channel.calls));
  } else {
    assert.fail('Document validation succeeded when it was expected to fail');
  }
}

function verifyDocumentNotCreated(doc, docType, expectedErrorMessages, expectedAuthorization) {
  verifyDocumentRejected(doc, void 0, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
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
    assert.equal(exceptionMessageMatches.length, 3, 'Unrecognized document validation error message format: "' + exception.forbidden + '"');

    var invalidDocMessage = exceptionMessageMatches[1].trim();
    assert.equal(
      invalidDocMessage,
      'Invalid ' + docType + ' document',
      'Unrecognized document validation error message format: "' + exception.forbidden + '"');

    actualErrorMessages = exceptionMessageMatches[2].trim().split(/;\s*/);
  } else {
    actualErrorMessages = [ exception.forbidden ];
  }

  for (var expectedErrorIndex = 0; expectedErrorIndex < expectedErrorMessages.length; expectedErrorIndex++) {
    var expectedErrorMsg = expectedErrorMessages[expectedErrorIndex];
    assert.ok(
      actualErrorMessages.indexOf(expectedErrorMsg) >= 0,
      'Document validation errors do not include expected error message: "' + expectedErrorMsg  + '". Actual error: ' + exception.forbidden);
  }

  // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), ensure
  // that neither list of validation errors contains an element that does not exist in the other
  for (var actualErrorIndex = 0; actualErrorIndex < actualErrorMessages.length; actualErrorIndex++) {
    var errorMessage = actualErrorMessages[actualErrorIndex];
    if (expectedErrorMessages.indexOf(errorMessage) < 0) {
      assert.fail('Unexpected document validation error: "' + errorMessage + '"');
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
  var channelAccessDeniedError = new Error('Channel access denied!');
  var roleAccessDeniedError = new Error('Role access denied!');
  var userAccessDeniedError = new Error('User access denied!');
  var generalAuthFailedMessage = 'missing channel access';

  requireAccess.throwWith(channelAccessDeniedError);
  requireRole.throwWith(roleAccessDeniedError);
  requireUser.throwWith(userAccessDeniedError);

  var syncFuncError = null;
  try {
    syncFunction(doc, oldDoc);
  } catch (ex) {
    syncFuncError = ex;
  }

  if (syncFuncError) {
    if (typeof expectedAuthorization === 'string' || expectedAuthorization instanceof Array) {
      assert.equal(
        syncFuncError,
        channelAccessDeniedError,
        'Document authorization error does not indicate channel access was denied. Actual: ' + JSON.stringify(syncFuncError));
    } else if (countAuthorizationTypes(expectedAuthorization) === 0) {
      verifyRequireAccess([ ]);
    } else if (countAuthorizationTypes(expectedAuthorization) > 1) {
      assert.equal(
        syncFuncError.forbidden,
        generalAuthFailedMessage,
        'Document authorization error does not indicate that channel, role and user access were all denied. Actual: ' + JSON.stringify(syncFuncError));
    } else if (expectedAuthorization.expectedChannels) {
      assert.equal(
        syncFuncError,
        channelAccessDeniedError,
        'Document authorization error does not indicate channel access was denied. Actual: ' + JSON.stringify(syncFuncError));
    } else if (expectedAuthorization.expectedRoles) {
      assert.equal(
        syncFuncError,
        roleAccessDeniedError,
        'Document authorization error does not indicate role access was denied. Actual: ' + JSON.stringify(syncFuncError));
    } else if (expectedAuthorization.expectedUsers) {
      assert.ok(
        syncFuncError,
        userAccessDeniedError,
        'Document authorization error does not indicate user access was denied. Actual: ' + JSON.stringify(syncFuncError));
    }

    verifyAuthorization(expectedAuthorization);
  } else {
    assert.fail('Document authorization succeeded when it was expected to fail');
  }
}

function verifyUnknownDocumentType(doc, oldDoc) {
  var syncFuncError = null;
  try {
    syncFunction(doc, oldDoc);
  } catch (ex) {
    syncFuncError = ex;
  }

  if (syncFuncError) {
    assert.equal(
      syncFuncError.forbidden,
      'Unknown document type',
      'Document validation error does not indicate the document type is unrecognized. Actual: ' + JSON.stringify(syncFuncError));

    assert.equal(channel.callCount, 0, 'Document was erroneously assigned to channels: ' + JSON.stringify(channel.calls));
    assert.equal(requireAccess.callCount, 0, 'Unexpected attempt to specify required channels: ' + JSON.stringify(requireAccess.calls));
    assert.equal(requireRole.callCount, 0, 'Unexpected attempt to specify required roles: ' + JSON.stringify(requireRole.calls));
    assert.equal(requireUser.callCount, 0, 'Unexpected attempt to specify required users: ' + JSON.stringify(requireUser.calls));
  } else {
    assert.fail('Document type was successfully identified when it was expected to be unknown');
  }
}
