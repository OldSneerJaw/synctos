// This module contains a collection of functions to be used when validating the sample document definitions

const testHelper = require('../../src/testing/test-helper.js');

function getExpectedAuthorization(expectedChannels) {
  return {
    expectedRoles: [ 'SERVICE' ],
    expectedUsers: [ 'ADMIN' ],
    expectedChannels: expectedChannels
  };
}

exports.getExpectedAuthorization = getExpectedAuthorization;

exports.verifyDocumentCreated = function(basePrivilegeName, businessId, doc) {
  testHelper.verifyDocumentCreated(doc, getExpectedAuthorization([ businessId + '-ADD_' + basePrivilegeName ]));
};

exports.verifyDocumentReplaced = function(basePrivilegeName, businessId, doc, oldDoc) {
  testHelper.verifyDocumentReplaced(doc, oldDoc, getExpectedAuthorization([ businessId + '-CHANGE_' + basePrivilegeName ]));
};

exports.verifyDocumentDeleted = function(basePrivilegeName, businessId, oldDoc) {
  testHelper.verifyDocumentDeleted(oldDoc, getExpectedAuthorization([ businessId + '-REMOVE_' + basePrivilegeName ]));
};

exports.verifyDocumentNotCreated = function(basePrivilegeName, businessId, doc, expectedDocType, expectedErrorMessages) {
  testHelper.verifyDocumentNotCreated(
    doc,
    expectedDocType,
    expectedErrorMessages,
    getExpectedAuthorization([ businessId + '-ADD_' + basePrivilegeName ]));
};

exports.verifyDocumentNotReplaced = function(basePrivilegeName, businessId, doc, oldDoc, expectedDocType, expectedErrorMessages) {
  testHelper.verifyDocumentNotReplaced(
    doc,
    oldDoc,
    expectedDocType,
    expectedErrorMessages,
    getExpectedAuthorization([ businessId + '-CHANGE_' + basePrivilegeName ]));
};
