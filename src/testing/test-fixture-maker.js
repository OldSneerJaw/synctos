const assert = require('assert');
const fs = require('fs');
const syncFunctionLoader = require('../loading/sync-function-loader');
const testEnvironmentMaker = require('./test-environment-maker');
const validationErrorFormatter = require('./validation-error-formatter');

/**
 * Initializes a test fixture for the sync function at the specified file path.
 *
 * @param {string} filePath The path to the sync function to load
 */
exports.initFromSyncFunction = function(filePath) {
  const rawSyncFunction = fs.readFileSync(filePath, 'utf8').toString();

  return init(rawSyncFunction, filePath);
};

/**
 * Initializes a test fixture for the document definitions at the specified file path.
 *
 * @param {string} filePath The path to the document definitions to load
 */
exports.initFromDocumentDefinitions = function(filePath) {
  const rawSyncFunction = syncFunctionLoader.load(filePath);

  return init(rawSyncFunction);
};

function init(rawSyncFunction, syncFunctionFile) {
  const testEnvironment = testEnvironmentMaker.init(rawSyncFunction, syncFunctionFile);

  const fixture = {
    /**
     * The generated document sync function to use for testing.
     *
     * @param {Object} doc The document to write. May include property "_deleted=true" to simulate a delete operation.
     * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
     *                        create operation.
     * @param {Object} userContext The CouchDB [user context](http://docs.couchdb.org/en/latest/json-structure.html#userctx-object)
     *                             of the authenticated user
     * @param {Object} securityInfo The CouchDB [security object](http://docs.couchdb.org/en/latest/json-structure.html#security-object)
     *                              for the database
     */
    syncFunction: testEnvironment.syncFunction,

    /**
     * An object that contains functions that are used to format expected validation error messages in specifications. Documentation can be
     * found in the "validation-error-formatter" module.
     */
    validationErrorFormatter,

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
     *                                               - expectedType: an optional string that indicates whether this is a "channel" (default) or "role" assignment
     *                                               - expectedChannels: an optional list of channels to assign to the users and roles
     *                                               - expectedUsers: an optional list of users to which to assign the channels
     *                                               - expectedRoles: an optional list of roles to which to assign the channels
     */
    verifyDocumentAccepted,

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
     *                                               - expectedType: an optional string that indicates whether this is a "channel" (default) or "role" assignment
     *                                               - expectedChannels: an optional list of channels to assign to the users and roles
     *                                               - expectedUsers: an optional list of users to which to assign the channels
     *                                               - expectedRoles: an optional list of roles to which to assign the channels
     */
    verifyDocumentCreated,

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
     *                                               - expectedType: an optional string that indicates whether this is a "channel" (default) or "role" assignment
     *                                               - expectedChannels: an optional list of channels to assign to the users and roles
     *                                               - expectedUsers: an optional list of users to which to assign the channels
     *                                               - expectedRoles: an optional list of roles to which to assign the channels
     */
    verifyDocumentReplaced,

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
     */
    verifyDocumentDeleted,

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
    verifyDocumentRejected,

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
    verifyDocumentNotCreated,

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
    verifyDocumentNotReplaced,

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
    verifyDocumentNotDeleted,

    /**
     * Verifies that the given exception result of a document write operation includes the specified validation error messages.
     *
     * @param {Object} docType The document's type as specified in the document definition
     * @param {string[]} expectedErrorMessages The list of validation error messages that should be contained in the exception. May be a string
     *                                         if only one validation error is expected.
     * @param {Object} exception The exception that was thrown by the sync function. Should include a "forbidden" property of type string.
     */
    verifyValidationErrors,

    /**
     * Verifies that the specified document that was created, replaced or deleted required the specified channels for access.
     *
     * @param {string[]} expectedChannels The list of all channels that are authorized to perform the operation. May be a string if only one channel
     *                                    is expected.
     */
    verifyRequireAccess,

    /**
     * Verifies that the specified document that was created, replaced or deleted required the specified roles for access.
     *
     * @param {string[]} expectedRoles The list of all roles that are authorized to perform the operation. May be a string if only one role is
     *                                 expected.
     */
    verifyRequireRole,

    /**
     * Verifies that the specified document that was created, replaced or deleted required the specified users for access.
     *
     * @param {string[]} expectedUsers The list of all users that are authorized to perform the operation. May be a string if only one user is
     *                                 expected.
     */
    verifyRequireUser,

    /**
     * Verifies that the specified channels were all assigned to a document that was created, replaced or deleted.
     *
     * @param {string[]} expectedChannels The list of channels that should have been assigned to the document. May be a string if only one
     *                                    channel is expected.
     */
    verifyChannelAssignment,

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
    verifyAccessDenied,

    /**
     * Verifies that the given document's type is unknown/invalid.
     *
     * @param {Object} doc The document to attempt to write. May include property "_deleted=true" to simulate a delete operation.
     * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
     *                        create operation.
     */
    verifyUnknownDocumentType,

    /**
     * A stub of the requireAccess function from the Sync Gateway sync function API:
     * https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#requireaccesschannels
     *
     * @param {string|string[]} channels The names of one or more channels that are authorized to perform the operation,
     *                                   specified either as a list or a single string
     */
    requireAccess: testEnvironment.requireAccess,

    /**
     * A stub of the requireRole function from the Sync Gateway sync function API:
     * https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#requirerolerolename
     *
     * @param {string|string[]} role The names of one or more roles that are authorized to perform the operation,
     *                               specified either as a list or a single string
     */
    requireRole: testEnvironment.requireRole,

    /**
     * A stub of the requireUser function from the Sync Gateway sync function API:
     * https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#requireuserusername
     *
     * @param {string|string[]} username The names of one or more users that are authorized to perform the operation,
     *                                   specified either as a list or a single string
     */
    requireUser: testEnvironment.requireUser,

    /**
     * A stub of the channel function from the Sync Gateway sync function API:
     * https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#channel-name
     *
     * @param {string|string[]} name The names of one or more channels to be assigned to the document, specified either
     *                               as a list or a single string
     */
    channel: testEnvironment.channel,

    /**
     * A stub of the access function from the Sync Gateway sync function API:
     * https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#access-username-channelname
     *
     * @param {string|string[]} username The names of one or more users or roles that are to be granted access to the
     *                                   channel(s), specified either as a list or a single string. Role names must be
     *                                   prefixed with "role:" to distinguish them from usernames.
     * @param {string|string[]} channels The names of one or more channels to assign the specified users/roles to
     */
    access: testEnvironment.access,

    /**
     * A stub of the role function from the Sync Gateway sync function API:
     * https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#role-username-rolename
     * @param {string|string[]} username The names of one or more users that are to be granted access to the role(s),
     *                                   specified either as a list or a single string
     * @param {string|string[]} role The names of one or more roles to assign the specified users to
     */
    role: testEnvironment.role,

    customActionStub: testEnvironment.customActionStub
  };

  const defaultWriteChannel = 'write';

  function verifyRequireAccess(expectedChannels) {
    assert.ok(fixture.requireAccess.callCount > 0, `Document does not specify required channels. Expected: ${expectedChannels}`);

    checkAuthorizations(expectedChannels, fixture.requireAccess.calls[0].arg, 'channel');
  }

  function verifyRequireRole(expectedRoles) {
    assert.ok(fixture.requireRole.callCount > 0, `Document does not specify required roles. Expected: ${expectedRoles}`);

    checkAuthorizations(expectedRoles, fixture.requireRole.calls[0].arg, 'role');
  }

  function verifyRequireUser(expectedUsers) {
    assert.ok(fixture.requireUser.callCount > 0, `Document does not specify required users. Expected: ${expectedUsers}`);

    checkAuthorizations(expectedUsers, fixture.requireUser.calls[0].arg, 'user');
  }

  function verifyChannelAssignment(expectedChannels) {
    assert.equal(fixture.channel.callCount, 1, `Document was not assigned to any channels. Expected: ${expectedChannels}`);

    checkAuthorizations(expectedChannels, fixture.channel.calls[0].arg, 'channel');
  }

  function checkAuthorizations(expectedAuthorizations, actualAuthorizations, authorizationType) {
    if (!Array.isArray(expectedAuthorizations)) {
      expectedAuthorizations = [ expectedAuthorizations ];
    }

    // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), ensure
    // that neither list of channels/roles/users contains an element that does not exist in the other
    expectedAuthorizations.forEach((expectedAuth) => {
      if (!actualAuthorizations.includes(expectedAuth)) {
        assert.fail(`Expected ${authorizationType} was not encountered: ${expectedAuth}. Actual ${authorizationType}s: ${actualAuthorizations}`);
      }
    });

    actualAuthorizations.forEach((actualAuth) => {
      if (!expectedAuthorizations.includes(actualAuth)) {
        assert.fail(`Unexpected ${authorizationType} encountered: ${actualAuth}. Expected ${authorizationType}s: ${expectedAuthorizations}`);
      }
    });
  }

  function areUnorderedListsEqual(list1, list2) {
    return list1.length === list2.length &&
      list1.every((element) => list2.includes(element)) &&
      list2.every((element) => list1.includes(element));
  }

  function accessAssignmentCallExists(accessFunction, expectedAssignees, expectedPermissions) {
    // Try to find an actual channel/role access assignment call that matches the expected call
    return accessFunction.calls.some((accessCall) => {
      return areUnorderedListsEqual(accessCall.args[0], expectedAssignees) && areUnorderedListsEqual(accessCall.args[1], expectedPermissions);
    });
  }

  function prefixRoleName(role) {
    return `role:${role}`;
  }

  function verifyChannelAccessAssignment(expectedAssignment) {
    const expectedUsersAndRoles = [ ];
    if (expectedAssignment.expectedUsers) {
      if (Array.isArray(expectedAssignment.expectedUsers)) {
        expectedUsersAndRoles.push(...expectedAssignment.expectedUsers);
      } else {
        expectedUsersAndRoles.push(expectedAssignment.expectedUsers);
      }
    }

    if (expectedAssignment.expectedRoles) {
      // The prefix "role:" must be applied to roles when calling the access function, as specified by
      // http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#access-username-channelname
      if (Array.isArray(expectedAssignment.expectedRoles)) {
        expectedAssignment.expectedRoles.forEach((expectedRole) => {
          expectedUsersAndRoles.push(prefixRoleName(expectedRole));
        });
      } else {
        expectedUsersAndRoles.push(prefixRoleName(expectedAssignment.expectedRoles));
      }
    }

    const expectedChannels = [ ];
    if (expectedAssignment.expectedChannels) {
      if (Array.isArray(expectedAssignment.expectedChannels)) {
        expectedChannels.push(...expectedAssignment.expectedChannels);
      } else {
        expectedChannels.push(expectedAssignment.expectedChannels);
      }
    }

    if (!accessAssignmentCallExists(fixture.access, expectedUsersAndRoles, expectedChannels)) {
      assert.fail(`Missing expected call to assign channel access (${JSON.stringify(expectedChannels)}) to users and roles (${JSON.stringify(expectedUsersAndRoles)})`);
    }
  }

  function verifyRoleAccessAssignment(expectedAssignment) {
    const expectedUsers = [ ];
    if (expectedAssignment.expectedUsers) {
      if (Array.isArray(expectedAssignment.expectedUsers)) {
        expectedUsers.push(...expectedAssignment.expectedUsers);
      } else {
        expectedUsers.push(expectedAssignment.expectedUsers);
      }
    }

    const expectedRoles = [ ];
    if (expectedAssignment.expectedRoles) {
      // The prefix "role:" must be applied to roles when calling the role function, as specified by
      // http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#role-username-rolename
      if (Array.isArray(expectedAssignment.expectedRoles)) {
        expectedAssignment.expectedRoles.forEach((expectedRole) => {
          expectedRoles.push(prefixRoleName(expectedRole));
        });
      } else {
        expectedRoles.push(prefixRoleName(expectedAssignment.expectedRoles));
      }
    }

    if (!accessAssignmentCallExists(fixture.role, expectedUsers, expectedRoles)) {
      assert.fail(`Missing expected call to assign role access (${JSON.stringify(expectedRoles)}) to users (${JSON.stringify(expectedUsers)})`);
    }
  }

  function verifyAccessAssignments(expectedAccessAssignments) {
    let expectedAccessCalls = 0;
    let expectedRoleCalls = 0;
    expectedAccessAssignments.forEach((expectedAssignment) => {
      if (expectedAssignment.expectedType === 'role') {
        verifyRoleAccessAssignment(expectedAssignment);
        expectedRoleCalls++;
      } else if (expectedAssignment.expectedType === 'channel' || !expectedAssignment.expectedType) {
        verifyChannelAccessAssignment(expectedAssignment);
        expectedAccessCalls++;
      } else {
        assert.fail(`Unrecognized expected access assignment type ("${expectedAssignment.expectedType}")`);
      }
    });

    if (fixture.access.callCount !== expectedAccessCalls) {
      assert.fail(`Number of calls to assign channel access (${fixture.access.callCount}) does not match expected (${expectedAccessCalls})`);
    }

    if (fixture.role.callCount !== expectedRoleCalls) {
      assert.fail(`Number of calls to assign role access (${fixture.role.callCount}) does not match expected (${expectedRoleCalls})`);
    }
  }

  function verifyOperationChannelsAssigned(doc, expectedChannels) {
    if (fixture.channel.callCount !== 1) {
      assert.fail('Document channels were not assigned');
    }

    const actualChannels = fixture.channel.calls[0].arg;
    if (Array.isArray(expectedChannels)) {
      expectedChannels.forEach((expectedChannel) => {
        assert.ok(
          actualChannels.includes(expectedChannel),
          `Document was not assigned to expected channel: ${expectedChannel}. Actual: ${actualChannels}`);
      });
    } else {
       assert.ok(
        actualChannels.includes(expectedChannels),
        `Document was not assigned to expected channel: "${expectedChannels}. Actual: ${actualChannels}`);
    }
  }

  function verifyAuthorization(expectedAuthorization) {
    let expectedOperationChannels = [ ];
    if (typeof expectedAuthorization === 'string' || Array.isArray(expectedAuthorization)) {
      // For backward compatibility, if the authorization parameter is not an object, treat it as the collection of channels that are required
      // for authorization
      expectedOperationChannels = expectedAuthorization;
      verifyRequireAccess(expectedAuthorization);
      assert.equal(fixture.requireRole.callCount, 0, `Unexpected document roles assigned: ${JSON.stringify(fixture.requireRole.calls)}`);
      assert.equal(fixture.requireUser.callCount, 0, `Unexpected document users assigned: ${JSON.stringify(fixture.requireUser.calls)}`);
    } else {
      if (expectedAuthorization.expectedChannels) {
        expectedOperationChannels = expectedAuthorization.expectedChannels;
        verifyRequireAccess(expectedAuthorization.expectedChannels);
      }

      if (expectedAuthorization.expectedRoles) {
        verifyRequireRole(expectedAuthorization.expectedRoles);
      } else {
        assert.equal(fixture.requireRole.callCount, 0, `Unexpected document roles assigned: ${JSON.stringify(fixture.requireRole.calls)}`);
      }

      if (expectedAuthorization.expectedUsers) {
        verifyRequireUser(expectedAuthorization.expectedUsers);
      } else {
        assert.equal(fixture.requireUser.callCount, 0, `Unexpected document users assigned: ${JSON.stringify(fixture.requireUser.calls)}`);
      }

      if (!expectedAuthorization.expectedChannels && !expectedAuthorization.expectedRoles && !expectedAuthorization.expectedUsers) {
        verifyRequireAccess([ ]);
      }
    }

    return expectedOperationChannels;
  }

  function verifyDocumentAccepted(doc, oldDoc, expectedAuthorization, expectedAccessAssignments) {
    fixture.syncFunction(doc, oldDoc || null);

    if (expectedAccessAssignments) {
      verifyAccessAssignments(expectedAccessAssignments);
    }

    const expectedOperationChannels = verifyAuthorization(expectedAuthorization);

    verifyOperationChannelsAssigned(doc, expectedOperationChannels);
  }

  function verifyDocumentCreated(doc, expectedAuthorization, expectedAccessAssignments) {
    verifyDocumentAccepted(doc, null, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
  }

  function verifyDocumentReplaced(doc, oldDoc, expectedAuthorization, expectedAccessAssignments) {
    verifyDocumentAccepted(doc, oldDoc, expectedAuthorization || defaultWriteChannel, expectedAccessAssignments);
  }

  function verifyDocumentDeleted(oldDoc, expectedAuthorization) {
    verifyDocumentAccepted({ _id: oldDoc._id, _deleted: true }, oldDoc, expectedAuthorization || defaultWriteChannel);
  }

  function verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
    let syncFuncError = null;
    try {
      fixture.syncFunction(doc, oldDoc || null);
    } catch (ex) {
      syncFuncError = ex;
    }

    if (syncFuncError) {
      verifyValidationErrors(docType, expectedErrorMessages, syncFuncError);
      verifyAuthorization(expectedAuthorization);

      assert.equal(fixture.channel.callCount, 0, `Document was erroneously assigned to channels: ${JSON.stringify(fixture.channel.calls)}`);
    } else {
      assert.fail('Document validation succeeded when it was expected to fail');
    }
  }

  function verifyDocumentNotCreated(doc, docType, expectedErrorMessages, expectedAuthorization) {
    verifyDocumentRejected(doc, null, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
  }

  function verifyDocumentNotReplaced(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
    verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
  }

  function verifyDocumentNotDeleted(oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
    verifyDocumentRejected({ _id: oldDoc._id, _deleted: true }, oldDoc, docType, expectedErrorMessages, expectedAuthorization || defaultWriteChannel);
  }

  function verifyValidationErrors(docType, expectedErrorMessages, exception) {
    if (!Array.isArray(expectedErrorMessages)) {
      expectedErrorMessages = [ expectedErrorMessages ];
    }

    // Used to split the leading component (e.g. "Invalid foobar document") from the validation error messages, which are separated by a colon
    const validationErrorRegex = /^([^:]+):\s*(.+)$/;

    const exceptionMessageMatches = validationErrorRegex.exec(exception.forbidden);
    let actualErrorMessages;
    if (exceptionMessageMatches) {
      assert.equal(exceptionMessageMatches.length, 3, `Unrecognized document validation error message format: "${exception.forbidden}"`);

      const invalidDocMessage = exceptionMessageMatches[1].trim();
      assert.equal(
        invalidDocMessage,
        `Invalid ${docType} document`,
        `Unrecognized document validation error message format: "${exception.forbidden}"`);

      actualErrorMessages = exceptionMessageMatches[2].trim().split(/;\s*/);
    } else {
      actualErrorMessages = [ exception.forbidden ];
    }

    // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), verify
    // that neither list of validation errors contains an element that does not exist in the other
    expectedErrorMessages.forEach((expectedErrorMsg) => {
      assert.ok(
        actualErrorMessages.includes(expectedErrorMsg),
        `Document validation errors do not include expected error message: "${expectedErrorMsg}". Actual error: ${exception.forbidden}`);
    });

    actualErrorMessages.forEach((errorMessage) => {
      if (!expectedErrorMessages.includes(errorMessage)) {
        assert.fail(`Unexpected document validation error: "${errorMessage}". Expected error: Invalid ${docType} document: ${expectedErrorMessages.join('; ')}`);
      }
    });
  }

  function countAuthorizationTypes(expectedAuthorization) {
    let count = 0;
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
    const channelAccessDeniedError = new Error('Channel access denied!');
    const roleAccessDeniedError = new Error('Role access denied!');
    const userAccessDeniedError = new Error('User access denied!');
    const generalAuthFailedMessage = 'missing channel access';

    fixture.requireAccess.throwWith(channelAccessDeniedError);
    fixture.requireRole.throwWith(roleAccessDeniedError);
    fixture.requireUser.throwWith(userAccessDeniedError);

    let syncFuncError = null;
    try {
      fixture.syncFunction(doc, oldDoc || null);
    } catch (ex) {
      syncFuncError = ex;
    }

    if (syncFuncError) {
      if (typeof expectedAuthorization === 'string' || Array.isArray(expectedAuthorization)) {
        assert.equal(
          syncFuncError,
          channelAccessDeniedError,
          `Document authorization error does not indicate channel access was denied. Actual: ${JSON.stringify(syncFuncError)}`);
      } else if (countAuthorizationTypes(expectedAuthorization) === 0) {
        verifyRequireAccess([ ]);
      } else if (countAuthorizationTypes(expectedAuthorization) > 1) {
        assert.equal(
          syncFuncError.forbidden,
          generalAuthFailedMessage,
          `Document authorization error does not indicate that channel, role and user access were all denied. Actual: ${JSON.stringify(syncFuncError)}`);
      } else if (expectedAuthorization.expectedChannels) {
        assert.equal(
          syncFuncError,
          channelAccessDeniedError,
          `Document authorization error does not indicate channel access was denied. Actual: ${JSON.stringify(syncFuncError)}`);
      } else if (expectedAuthorization.expectedRoles) {
        assert.equal(
          syncFuncError,
          roleAccessDeniedError,
          `Document authorization error does not indicate role access was denied. Actual: ${JSON.stringify(syncFuncError)}`);
      } else {
        assert.ok(
          syncFuncError,
          userAccessDeniedError,
          `Document authorization error does not indicate user access was denied. Actual: ${JSON.stringify(syncFuncError)}`);
      }

      verifyAuthorization(expectedAuthorization);
    } else {
      assert.fail('Document authorization succeeded when it was expected to fail');
    }
  }

  function verifyUnknownDocumentType(doc, oldDoc) {
    let syncFuncError = null;
    try {
      fixture.syncFunction(doc, oldDoc || null);
    } catch (ex) {
      syncFuncError = ex;
    }

    if (syncFuncError) {
      assert.equal(
        syncFuncError.forbidden,
        'Unknown document type',
        `Document validation error does not indicate the document type is unrecognized. Actual: ${JSON.stringify(syncFuncError)}`);

      assert.equal(fixture.channel.callCount, 0, `Document was erroneously assigned to channels: ${JSON.stringify(fixture.channel.calls)}`);
      assert.equal(fixture.requireAccess.callCount, 0, `Unexpected attempt to specify required channels: ${JSON.stringify(fixture.requireAccess.calls)}`);
      assert.equal(fixture.requireRole.callCount, 0, `Unexpected attempt to specify required roles: ${JSON.stringify(fixture.requireRole.calls)}`);
      assert.equal(fixture.requireUser.callCount, 0, `Unexpected attempt to specify required users: ${JSON.stringify(fixture.requireUser.calls)}`);
    } else {
      assert.fail('Document type was successfully identified when it was expected to be unknown');
    }
  }

  return fixture;
}
