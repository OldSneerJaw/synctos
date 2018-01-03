var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;
var expect = require('chai').expect;

describe('Custom actions:', function() {
  var expectedAuthorization = {
    expectedChannels: [ 'write-channel' ],
    expectedRoles: [ 'write-role' ],
    expectedUsers: [ 'write-user' ]
  };

  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-custom-actions-sync-function.js');
  });

  describe('the onTypeIdentificationSucceeded event', function() {
    var docType = 'onTypeIdentifiedDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is replaced', function() {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is deleted', function() {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onTypeIdentificationSucceeded');
    });

    it('does not execute a custom action if the type cannot be identified', function() {
      var unknownDocType = 'foo';
      var doc = { _id: unknownDocType };

      try {
        testHelper.syncFunction(doc, expectedAuthorization);
        expect.fail('Expected error during custom action not thrown');
      } catch(ex) {
        testHelper.verifyValidationErrors(unknownDocType, errorFormatter.unknownDocumentType(), ex);
      }
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAuthorizationSucceeded event', function() {
    var docType = 'onAuthorizationDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is replaced', function() {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is deleted', function() {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onAuthorizationSucceeded');
    });

    it('does not execute a custom action if authorization was denied', function() {
      testHelper.verifyAccessDenied(doc, null, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onValidationSucceeded event', function() {
    var docType = 'onValidationDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is replaced', function() {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is deleted', function() {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onValidationSucceeded');
    });

    it('does not execute a custom action if the document contents are invalid', function() {
      var doc = {
        _id: docType,
        unsupportedProperty: 'foobar'
      };

      testHelper.verifyDocumentNotCreated(doc, docType, errorFormatter.unsupportedProperty('unsupportedProperty'), expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAccessAssignmentsSucceeded event', function() {
    var docType = 'onAccessAssignmentsDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onAccessAssignmentsSucceeded');
    });

    it('executes a custom action when a document is replaced', function() {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onAccessAssignmentsSucceeded');
    });

    it('executes a custom action when a document is deleted', function() {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onAccessAssignmentsSucceeded');
    });

    it('does not execute a custom action if the document definition does not define access assignments', function() {
      var doc = { _id: 'missingAccessAssignmentsDoc' };

      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });

    it('does not execute a custom action if the document definition has an empty access assignments definition', function() {
      var doc = { _id: 'emptyAccessAssignmentsDoc' };

      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onDocumentChannelAssignmentSucceeded event', function() {
    var docType = 'onDocChannelsAssignedDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onDocumentChannelAssignmentSucceeded');
    });

    it('executes a custom action when a document is replaced', function() {

      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onDocumentChannelAssignmentSucceeded');
    });

    it('executes a custom action when a document is deleted', function() {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onDocumentChannelAssignmentSucceeded');
    });

    it('does not execute a custom action if doc channel assignment fails', function() {
      var expectedError = new Error('bad channels!');
      testHelper.channel.throwWith(expectedError);

      try {
        testHelper.syncFunction(doc);
        expect.fail('Expected error during custom action not thrown');
      } catch(ex) {
        expect(ex).to.equal(expectedError);
      }
      verifyCustomActionNotExecuted();
    });
  });
});

function verifyCustomActionExecuted(doc, oldDoc, expectedActionType) {
  expect(testHelper.customActionStub.callCount).to.equal(1);
  expect(testHelper.customActionStub.calls[0].args[0]).to.eql(doc);
  expect(testHelper.customActionStub.calls[0].args[1]).to.eql(oldDoc);

  verifyCustomActionMetadata(testHelper.customActionStub.calls[0].args[2], doc._id, expectedActionType);
}

function verifyCustomActionNotExecuted() {
  expect(testHelper.customActionStub.callCount).to.equal(0);
}

function verifyCustomActionMetadata(actualMetadata, docType, expectedActionType) {
  verifyTypeMetadata(actualMetadata, docType);
  verifyAuthorizationMetadata(actualMetadata);
  verifyAccessAssignmentMetadata(actualMetadata);
  verifyDocChannelsMetadata(actualMetadata);
  verifyCustomActionTypeMetadata(actualMetadata, expectedActionType);
}

function verifyTypeMetadata(actualMetadata, docType) {
  expect(actualMetadata.documentTypeId).to.equal(docType);
  expect(actualMetadata.documentDefinition.typeFilter({ _id: docType })).to.equal(true);
}

function verifyAuthorizationMetadata(actualMetadata) {
  var expectedAuthMetadata = {
    channels: [ 'write-channel' ],
    roles: [ 'write-role' ],
    users: [ 'write-user' ]
  };
  expect(actualMetadata.authorization).to.eql(expectedAuthMetadata);
}

function verifyAccessAssignmentMetadata(actualMetadata) {
  if (actualMetadata.documentDefinition.accessAssignments) {
    var expectedAssignments = [ ];
    for (var i = 0; i < actualMetadata.documentDefinition.accessAssignments.length; i++) {
      var assignment = actualMetadata.documentDefinition.accessAssignments[i];
      expectedAssignments.push({
        type: 'channel',
        channels: [ assignment.channels ],
        usersAndRoles: [ assignment.users, 'role:' + assignment.roles ]
      });
    }
    expect(actualMetadata.accessAssignments).to.eql(expectedAssignments);
  } else {
    expect(actualMetadata.accessAssignments).to.equal(void 0);
  }
}

function verifyDocChannelsMetadata(actualMetadata) {
  expect(actualMetadata.documentChannels).to.eql([ 'write-channel' ]);
}

function verifyCustomActionTypeMetadata(actualMetadata, expectedActionType) {
  expect(actualMetadata.actionType).to.equal(expectedActionType);
}

function getDeletedDoc(docType) {
  return {
    _id: docType,
    _deleted: true
  };
}
