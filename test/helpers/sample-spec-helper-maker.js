/**
 * Initialize a collection of helper functions to be used when validating the sample document definitions.
 *
 * @param {Object} testFixture The test fixture to use
 */
exports.init = function(testFixture) {
  return {
    getExpectedAuthorization,

    verifyDocumentCreated(basePrivilegeName, businessId, doc) {
      testFixture.verifyDocumentCreated(doc, getExpectedAuthorization([ `${businessId}-ADD_${basePrivilegeName}` ]));
    },

    verifyDocumentReplaced(basePrivilegeName, businessId, doc, oldDoc) {
      testFixture.verifyDocumentReplaced(doc, oldDoc, getExpectedAuthorization([ `${businessId}-CHANGE_${basePrivilegeName}` ]));
    },

    verifyDocumentDeleted(basePrivilegeName, businessId, oldDoc) {
      testFixture.verifyDocumentDeleted(oldDoc, getExpectedAuthorization([ `${businessId}-REMOVE_${basePrivilegeName}` ]));
    },

    verifyDocumentNotCreated(basePrivilegeName, businessId, doc, expectedDocType, expectedErrorMessages) {
      testFixture.verifyDocumentNotCreated(
        doc,
        expectedDocType,
        expectedErrorMessages,
        getExpectedAuthorization([ `${businessId}-ADD_${basePrivilegeName}` ]));
    },

    verifyDocumentNotReplaced(basePrivilegeName, businessId, doc, oldDoc, expectedDocType, expectedErrorMessages) {
      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        expectedDocType,
        expectedErrorMessages,
        getExpectedAuthorization([ `${businessId}-CHANGE_${basePrivilegeName}` ]));
    }
  };
};

function getExpectedAuthorization(expectedChannels) {
  return {
    expectedRoles: [ 'SERVICE' ],
    expectedUsers: [ 'ADMIN' ],
    expectedChannels
  };
}
