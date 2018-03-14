const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');
const { expect } = require('chai');

describe('Custom actions:', () => {
  let testFixture;

  const expectedAuthorization = {
    expectedChannels: [ 'write-channel' ],
    expectedRoles: [ 'write-role' ],
    expectedUsers: [ 'write-user' ]
  };

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-custom-actions-sync-function.js');
  });

  describe('the onTypeIdentificationSucceeded event', () => {
    const docType = 'onTypeIdentifiedDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, null, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onTypeIdentificationSucceeded');
    });

    it('does not execute a custom action if the type cannot be identified', () => {
      const unknownDocType = 'foo';
      const doc = { _id: unknownDocType };

      let syncFuncError = null;
      expect(() => {
        try {
          testFixture.testEnvironment.syncFunction(doc);
        } catch (ex) {
          syncFuncError = ex;

          throw ex;
        }
      }).to.throw();

      testFixture.verifyValidationErrors(unknownDocType, errorFormatter.unknownDocumentType(), syncFuncError);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAuthorizationSucceeded event', () => {
    const docType = 'onAuthorizationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, null, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onAuthorizationSucceeded');
    });

    it('does not execute a custom action if authorization was denied', () => {
      testFixture.verifyAccessDenied(doc, null, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onValidationSucceeded event', () => {
    const docType = 'onValidationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, null, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onValidationSucceeded');
    });

    it('does not execute a custom action if the document contents are invalid', () => {
      const doc = {
        _id: docType,
        unsupportedProperty: 'foobar'
      };

      testFixture.verifyDocumentNotCreated(doc, docType, errorFormatter.unsupportedProperty('unsupportedProperty'), expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAccessAssignmentsSucceeded event', () => {
    const docType = 'onAccessAssignmentsDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, null, 'onAccessAssignmentsSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onAccessAssignmentsSucceeded');
    });

    it('does not execute a custom action when a document is deleted', () => {
      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });

    it('does not execute a custom action if the document definition does not define access assignments', () => {
      const doc = { _id: 'missingAccessAssignmentsDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });

    it('does not execute a custom action if the document definition has an empty access assignments definition', () => {
      const doc = { _id: 'emptyAccessAssignmentsDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onDocumentChannelAssignmentSucceeded event', () => {
    const docType = 'onDocChannelsAssignedDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, null, 'onDocumentChannelAssignmentSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {

      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onDocumentChannelAssignmentSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onDocumentChannelAssignmentSucceeded');
    });

    it('does not execute a custom action if doc channel assignment fails', () => {
      const expectedError = new Error('bad channels!');
      testFixture.testEnvironment.channel.throwWith(expectedError);

      expect(() => {
        testFixture.testEnvironment.syncFunction(doc);
      }).to.throw(expectedError);

      verifyCustomActionNotExecuted();
    });
  });

  function verifyCustomActionExecuted(doc, oldDoc, expectedActionType) {
    expect(testFixture.testEnvironment.customActionStub.callCount).to.equal(1);
    expect(testFixture.testEnvironment.customActionStub.calls[0].args[0]).to.eql(doc);
    expect(testFixture.testEnvironment.customActionStub.calls[0].args[1]).to.eql(oldDoc);

    verifyCustomActionMetadata(testFixture.testEnvironment.customActionStub.calls[0].args[2], doc._id, expectedActionType);
  }

  function verifyCustomActionNotExecuted() {
    expect(testFixture.testEnvironment.customActionStub.callCount).to.equal(0);
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
    const expectedAuthMetadata = {
      channels: [ 'write-channel' ],
      roles: [ 'write-role' ],
      users: [ 'write-user' ]
    };
    expect(actualMetadata.authorization).to.eql(expectedAuthMetadata);
  }

  function verifyAccessAssignmentMetadata(actualMetadata) {
    if (actualMetadata.documentDefinition.accessAssignments) {
      const expectedAssignments = actualMetadata.documentDefinition.accessAssignments.map((assignment) => ({
        type: 'channel',
        channels: [ assignment.channels ],
        usersAndRoles: [ assignment.users, `role:${assignment.roles}` ]
      }));

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
});
