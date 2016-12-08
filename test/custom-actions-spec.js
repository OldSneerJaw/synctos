var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;
var expect = require('expect.js');

describe('Custom actions:', function() {
  var expectedAuthorization = {
    expectedChannels: [ 'write-channel' ],
    expectedRoles: [ 'write-role' ],
    expectedUsers: [ 'write-user' ]
  };

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-custom-actions-sync-function.js');
  });

  describe('the onTypeIdentificationSucceeded event', function() {
    var docType = 'onTypeIdentifiedDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, undefined, 'onTypeIdentificationSucceeded');
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

      expect(testHelper.syncFunction).withArgs(doc, expectedAuthorization).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(unknownDocType, errorFormatter.unknownDocumentType(), ex);
      });
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAuthorizationSucceeded event', function() {
    var docType = 'onAuthorizationDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, undefined, 'onAuthorizationSucceeded');
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
      verifyCustomActionExecuted(doc, undefined, 'onValidationSucceeded');
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
      verifyCustomActionExecuted(doc, undefined, 'onAccessAssignmentsSucceeded');
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
  });

  describe('the onDocumentChannelAssignmentSucceeded event', function() {
    var docType = 'onDocChannelsAssignedDoc';
    var doc = { _id: docType };
    var oldDoc = { _id: docType };

    it('executes a custom action when a document is created', function() {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, undefined, 'onDocumentChannelAssignmentSucceeded');
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

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.equal(expectedError);
      });
      verifyCustomActionNotExecuted();
    });
  });
});

function verifyCustomActionExecuted(doc, oldDoc, expectedActionType) {
  expect(testHelper.customActionStub.callCount).to.be(1);
  expect(testHelper.customActionStub.calls[0].args[0]).to.eql(doc);
  expect(testHelper.customActionStub.calls[0].args[1]).to.eql(oldDoc);

  verifyCustomActionMetadata(testHelper.customActionStub.calls[0].args[2], doc._id, expectedActionType);
}

function verifyCustomActionNotExecuted() {
  expect(testHelper.customActionStub.callCount).to.be(0);
}

function verifyCustomActionMetadata(actualMetadata, docType, expectedActionType) {
  verifyTypeMetadata(actualMetadata, docType);
  verifyAuthorizationMetadata(actualMetadata);
  verifyAccessAssignmentMetadata(actualMetadata);
  verifyDocChannelsMetadata(actualMetadata);
  verifyCustomActionTypeMetadata(actualMetadata, expectedActionType);
}

function verifyTypeMetadata(actualMetadata, docType) {
  expect(actualMetadata.documentTypeId).to.be(docType);
  expect(actualMetadata.documentDefinition.typeFilter({ _id: docType })).to.be(true);
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
    expect(actualMetadata.accessAssignments).to.be(undefined);
  }
}

function verifyDocChannelsMetadata(actualMetadata) {
  expect(actualMetadata.documentChannels).to.eql([ 'write-channel' ]);
}

function verifyCustomActionTypeMetadata(actualMetadata, expectedActionType) {
  expect(actualMetadata.actionType).to.be(expectedActionType);
}

function getDeletedDoc(docType) {
  return {
    _id: docType,
    _deleted: true
  };
}
