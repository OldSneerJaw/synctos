const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');
const { expect } = require('chai');

describe('Custom actions:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-custom-actions-sync-function.js');

  const expectedAuthorization = {
    expectedChannels: [ 'write-channel' ],
    expectedRoles: [ 'write-role' ],
    expectedUsers: [ 'write-user' ]
  };

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('the onTypeIdentificationSucceeded event', () => {
    const docType = 'onTypeIdentifiedDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecution(doc, null, docType, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecution(doc, oldDoc, docType, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecution(getDeletedDoc(docType), oldDoc, docType, 'onTypeIdentificationSucceeded');
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
    });
  });

  describe('the onAuthorizationSucceeded event', () => {
    const docType = 'onAuthorizationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecution(doc, null, docType, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecution(doc, oldDoc, docType, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecution(getDeletedDoc(docType), oldDoc, docType, 'onAuthorizationSucceeded');
    });

    it('does not execute a custom action if authorization was denied', () => {
      testFixture.verifyAccessDenied(doc, null, expectedAuthorization);
    });
  });

  describe('the onValidationSucceeded event', () => {
    const docType = 'onValidationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecution(doc, null, docType, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecution(doc, oldDoc, docType, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecution(getDeletedDoc(docType), oldDoc, docType, 'onValidationSucceeded');
    });

    it('does not execute a custom action if the document contents are invalid', () => {
      const doc = {
        _id: docType,
        unsupportedProperty: 'foobar'
      };

      testFixture.verifyDocumentNotCreated(doc, docType, errorFormatter.unsupportedProperty('unsupportedProperty'), expectedAuthorization);
    });
  });

  describe('the onAccessAssignmentsSucceeded event', () => {
    const docType = 'onAccessAssignmentsDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecution(doc, null, docType, 'onAccessAssignmentsSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecution(doc, oldDoc, docType, 'onAccessAssignmentsSucceeded');
    });

    it('does not execute a custom action when a document is deleted', () => {
      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
    });

    it('does not execute a custom action if the document definition does not define access assignments', () => {
      const doc = { _id: 'missingAccessAssignmentsDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
    });

    it('does not execute a custom action if the document definition has an empty access assignments definition', () => {
      const doc = { _id: 'emptyAccessAssignmentsDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
    });
  });

  describe('the onDocumentChannelAssignmentSucceeded event', () => {
    const docType = 'onDocChannelsAssignedDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecution(doc, null, docType, 'onDocumentChannelAssignmentSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecution(doc, oldDoc, docType, 'onDocumentChannelAssignmentSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecution(getDeletedDoc(docType), oldDoc, docType, 'onDocumentChannelAssignmentSucceeded');
    });

    it('does not execute a custom action if doc channel assignment fails', () => {
      const expectedError = new Error('bad channels!');
      testFixture.testEnvironment.channel.throwWith(expectedError);

      expect(() => {
        testFixture.testEnvironment.syncFunction(doc);
      }).to.throw(expectedError);
    });
  });

  function verifyCustomActionExecution(doc, oldDoc, docType, expectedActionType) {
    let syncFuncError = null;
    expect(() => {
      try {
        testFixture.testEnvironment.syncFunction(doc, oldDoc);
      } catch (ex) {
        syncFuncError = ex;
        throw ex;
      }
    }).to.throw();

    expect(syncFuncError.doc).to.eql(doc);
    expect(syncFuncError.oldDoc).to.eql(oldDoc);
    expect(syncFuncError.actionType).to.eql(expectedActionType);

    verifyCustomActionMetadata(syncFuncError.customActionMetadata, docType, expectedActionType);
  }

  function verifyCustomActionMetadata(actualMetadata, docType, expectedActionType) {
    verifyTypeMetadata(actualMetadata, docType);

    if (expectedActionType === 'onTypeIdentificationSucceeded') {
      return;
    }

    verifyAuthorizationMetadata(actualMetadata);

    if (expectedActionType === 'onAuthorizationSucceeded' || expectedActionType === 'onValidationSucceeded') {
      return;
    }

    verifyAccessAssignmentMetadata(actualMetadata);

    if (expectedActionType === 'onAccessAssignmentsSucceeded') {
      return;
    }

    verifyDocChannelsMetadata(actualMetadata);
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

  function getDeletedDoc(docType) {
    return {
      _id: docType,
      _deleted: true
    };
  }
});
