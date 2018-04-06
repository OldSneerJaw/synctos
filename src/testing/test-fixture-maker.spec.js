const { expect } = require('chai');
const mockRequire = require('mock-require');
const simpleMock = require('../../lib/simple-mock/index');

describe('Test fixture maker:', () => {
  let testFixtureMaker, fsMock, syncFunctionLoaderMock, testEnvironmentMakerMock;

  const fakeFilePath = 'my-file-path';
  const fakeSyncFunctionContents = 'my-sync-function';

  beforeEach(() => {
    // Stub out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    fsMock.readFileSync.returnWith(fakeSyncFunctionContents);
    mockRequire('fs', fsMock);

    syncFunctionLoaderMock = { load: simpleMock.stub() };
    syncFunctionLoaderMock.load.returnWith(fakeSyncFunctionContents);
    mockRequire('../loading/sync-function-loader', syncFunctionLoaderMock);

    testEnvironmentMakerMock = { init: simpleMock.stub() };
    testEnvironmentMakerMock.init.callFn(fakeTestEnvironment);
    mockRequire('./test-environment-maker', testEnvironmentMakerMock);

    testFixtureMaker = mockRequire.reRequire('./test-fixture-maker');
  });

  afterEach(() => {
    mockRequire.stopAll();
  });

  describe('when initializing a test environment', () => {
    it('can initialize from a sync function', () => {
      fsMock.readFileSync.returnWith(fakeSyncFunctionContents);

      const testFixture = testFixtureMaker.initFromSyncFunction(fakeFilePath);

      expect(fsMock.readFileSync.callCount).to.equal(1);
      expect(fsMock.readFileSync.calls[0].args).to.eql([ fakeFilePath, 'utf8' ]);

      expect(testEnvironmentMakerMock.init.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.init.calls[0].args).to.eql([ fakeSyncFunctionContents, fakeFilePath ]);

      verifyTestEnvironment(testFixture);
    });

    it('can initialize directly from document definitions', () => {
      syncFunctionLoaderMock.load.returnWith(fakeSyncFunctionContents);

      const testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);

      expect(syncFunctionLoaderMock.load.callCount).to.equal(1);
      expect(syncFunctionLoaderMock.load.calls[0].args).to.eql([ fakeFilePath ]);

      expect(testEnvironmentMakerMock.init.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.init.calls[0].args).to.eql([ fakeSyncFunctionContents, void 0 ]);

      verifyTestEnvironment(testFixture);
    });

    function verifyTestEnvironment(testFixture) {
      // Verify the validation function source code
      expect(testFixture.testEnvironment.syncFunction).to.be.a('function');
      expect(testFixture.testEnvironment.syncFunction.toString())
        .to.equal(fakeTestEnvironment().syncFunction.toString());
    }
  });

  describe('when verifying that document authorization is denied', () => {
    let testFixture = null;

    beforeEach(() => {
      if (testFixture === null) {
        testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);
      } else {
        testFixture.resetTestEnvironment();
      }
    });

    it('fails if it encounters a required channel that was not expected', () => {
      const actualChannels = [ 'my-channel-1', 'my-channel-2' ];
      const expectedChannels = [ 'my-channel-1' ];

      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.requireAccess(actualChannels);
      };

      expect(() => {
        testFixture.verifyAccessDenied({ }, null, expectedChannels);
      }).to.throw(`Unexpected channel encountered: my-channel-2. Expected channels: ${expectedChannels.join(',')}`);
    });

    it('fails if it does not encounter a channel that was expected', () => {
      const actualChannels = [ 'my-channel-1' ];
      const expectedChannels = [ 'my-channel-1', 'my-channel-2' ];

      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.requireAccess(actualChannels);
      };

      expect(() => {
        testFixture.verifyAccessDenied({ }, null, expectedChannels);
      }).to.throw(`Expected channel was not encountered: my-channel-2. Actual channels: ${actualChannels.join(',')}`);
    });

    it('fails if the sync function does not throw an error', () => {
      testFixture.testEnvironment.syncFunction = () => { };

      expect(() => {
        testFixture.verifyAccessDenied({ }, null, [ ]);
      }).to.throw('Document authorization succeeded when it was expected to fail');
    });

    it('succeeds if there are no expected channels, roles or users allowed', () => {
      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.requireAccess([ ]);
      };

      expect(() => {
        testFixture.verifyAccessDenied({ }, null, { });
      }).not.to.throw();
    });
  });

  describe('when verifying that a document type is unknown', () => {
    let testFixture = null;

    beforeEach(() => {
      if (testFixture === null) {
        testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);
      } else {
        testFixture.resetTestEnvironment();
      }
    });

    it('fails if the document type is recognized', () => {
      testFixture.testEnvironment.syncFunction = () => { };

      expect(() => {
        testFixture.verifyUnknownDocumentType({ });
      }).to.throw('Document type was successfully identified when it was expected to be unknown');
    });
  });

  describe('when verifying that document contents are invalid', () => {
    const docType = 'my-doc-type';
    let testFixture = null;

    beforeEach(() => {
      if (testFixture === null) {
        testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);
      } else {
        testFixture.resetTestEnvironment();
      }
    });

    it('fails if the sync function does not throw an error', () => {
      testFixture.testEnvironment.syncFunction = () => { };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, [ ], { expectedRoles: 'my-role' });
      }).to.throw('Document validation succeeded when it was expected to fail');
    });

    it('fails if the validation error message format is invalid', () => {
      const errorMessage = 'Foo: bar';

      testFixture.testEnvironment.syncFunction = () => {
        throw { forbidden: errorMessage };
      };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, [ ], 'my-role');
      }).to.throw(`Unrecognized document validation error message format: "${errorMessage}"`);
    });

    it('fails if an expected validation error is missing', () => {
      const expectedErrors = [ 'my-error-1', 'my-error-2' ];
      const errorMessage = `Invalid ${docType} document: ${expectedErrors[0]}`;

      testFixture.testEnvironment.syncFunction = () => {
        throw { forbidden: errorMessage };
      };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, expectedErrors, { });
      }).to.throw(`Document validation errors do not include expected error message: "${expectedErrors[1]}". Actual error: ${errorMessage}`);
    });

    it('fails if an unexpected validation error is encountered', () => {
      const actualErrors = [ 'my-error-1', 'my-error-2' ];
      const actualErrorMessage = `Invalid ${docType} document: ${actualErrors[0]}; ${actualErrors[1]}`;
      const expectedErrors = [ actualErrors[0] ];
      const expectedErrorMessage = `Invalid ${docType} document: ${expectedErrors[0]}`;

      testFixture.testEnvironment.syncFunction = () => {
        throw { forbidden: actualErrorMessage };
      };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, expectedErrors, { expectedUsers: 'me' });
      }).to.throw(`Unexpected document validation error: "${actualErrors[1]}". Expected error: ${expectedErrorMessage}`);
    });
  });

  describe('when verifying that document contents are correct', () => {
    let testFixture = null;

    beforeEach(() => {
      if (testFixture === null) {
        testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);
      } else {
        testFixture.resetTestEnvironment();
      }
    });

    it('fails if the channel assignment function was not called', () => {
      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.requireAccess([ ]);
      };

      expect(() => {
        testFixture.verifyDocumentAccepted({ }, null, [ ]);
      }).to.throw('Document channels were not assigned');
    });
  });

  describe('when verifying access assignments', () => {
    let testFixture = null;

    beforeEach(() => {
      if (testFixture === null) {
        testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);
      } else {
        testFixture.resetTestEnvironment();
      }
    });

    it('fails if a different set of channel access is assigned than what was expected', () => {
      const actualChannels = [ 'my-channel-1' ];
      const expectedChannelAccessAssignment = {
        expectedType: 'channel',
        expectedRoles: [ 'my-role-1' ],
        foo: [ 'bar' ] // This should be ignored
      };
      const expectedEffectiveRoles = expectedChannelAccessAssignment.expectedRoles.map((role) => `role:${role}`);

      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.access(expectedEffectiveRoles, actualChannels);
      };

      expect(() => {
        testFixture.verifyDocumentAccepted({ }, void 0, [ ], [ expectedChannelAccessAssignment ]);
      }).to.throw(`Missing expected call to assign channel access (${JSON.stringify([ ])}) to users and roles (${JSON.stringify(expectedEffectiveRoles)})`);
    });

    it('fails if a different set of role access is assigned than what was expected', () => {
      const expectedRoleAccessAssignment = {
        expectedType: 'role',
        expectedRoles: [ 'my-role-1', 'my-role-2' ],
        expectedUsers: [ 'my-user-1', 'my-user-2', 'my-user-3' ]
      };
      const expectedEffectiveRoles = expectedRoleAccessAssignment.expectedRoles.map((role) => `role:${role}`);
      const actualUsers = [ 'my-user-1', 'my-user-2', 'my-user-2' ];

      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.role(actualUsers, expectedEffectiveRoles);
      };

      expect(() => {
        testFixture.verifyDocumentAccepted({ }, void 0, [ ], [ expectedRoleAccessAssignment ]);
      }).to.throw(`Missing expected call to assign role access (${JSON.stringify(expectedEffectiveRoles)}) to users (${JSON.stringify(expectedRoleAccessAssignment.expectedUsers)})`);
    });

    it('fails if there is a call to assign channel access when none is expected', () => {
      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.access();
      };

      expect(() => {
        testFixture.verifyDocumentAccepted({ }, void 0, [ ], [ ]);
      }).to.throw('Number of calls to assign channel access (1) does not match expected (0)');
    });

    it('fails if there is a call to assign role access when none is expected', () => {
      testFixture.testEnvironment.syncFunction = () => {
        testFixture.testEnvironment.role();
      };

      expect(() => {
        testFixture.verifyDocumentAccepted({ }, void 0, [ ], [ ]);
      }).to.throw('Number of calls to assign role access (1) does not match expected (0)');
    });

    it('fails if there is an unrecognized access assignment type', () => {
      const expectedInvalidAccessAssignment = {
        expectedType: 'invalid-type',
        expectedRoles: [ 'my-role-1' ],
        expectedUsers: [ 'my-user-1' ]
      };

      testFixture.testEnvironment.syncFunction = () => { };

      expect(() => {
        testFixture.verifyDocumentAccepted({ }, void 0, [ ], [ expectedInvalidAccessAssignment ]);
      }).to.throw(`Unrecognized expected access assignment type ("${expectedInvalidAccessAssignment.expectedType}")`);
    });
  });
});

function fakeTestEnvironment() {
  return {
    _: simpleMock.stub(),
    requireAccess: simpleMock.stub(),
    requireRole: simpleMock.stub(),
    requireUser: simpleMock.stub(),
    channel: simpleMock.stub(),
    access: simpleMock.stub(),
    role: simpleMock.stub(),
    syncFunction: simpleMock.stub()
  };
}
