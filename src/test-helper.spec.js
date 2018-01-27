var expect = require('chai').expect;
var simpleMock = require('../lib/simple-mock/index');
var mockRequire = require('mock-require');

describe('Test helper:', function() {
  var testHelper, fsMock, syncFunctionLoaderMock, testEnvironmentMakerMock, fakeTestEnvironment;

  var fakeFilePath = 'my-file-path';
  var fakeSyncFunctionContents = 'my-sync-function';

  beforeEach(function() {
    fakeTestEnvironment = {
      _: simpleMock.stub(),
      requireAccess: simpleMock.stub(),
      requireRole: simpleMock.stub(),
      requireUser: simpleMock.stub(),
      channel: simpleMock.stub(),
      access: simpleMock.stub(),
      role: simpleMock.stub(),
      customActionStub: simpleMock.stub(),
      syncFunction: simpleMock.stub()
    };

    // Stub out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    fsMock.readFileSync.returnWith(fakeSyncFunctionContents);
    mockRequire('fs', fsMock);

    syncFunctionLoaderMock = { load: simpleMock.stub() };
    syncFunctionLoaderMock.load.returnWith(fakeSyncFunctionContents);
    mockRequire('./sync-function-loader', syncFunctionLoaderMock);

    testEnvironmentMakerMock = { init: simpleMock.stub() };
    testEnvironmentMakerMock.init.returnWith(fakeTestEnvironment);
    mockRequire('./test-environment-maker', testEnvironmentMakerMock);

    testHelper = mockRequire.reRequire('./test-helper');
  });

  afterEach(function() {
    mockRequire.stopAll();
  });

  describe('when initializing a test environment', function() {
    it('can initialize from a sync function', function() {
      fsMock.readFileSync.returnWith(fakeSyncFunctionContents);

      testHelper.initSyncFunction(fakeFilePath);

      expect(fsMock.readFileSync.callCount).to.equal(1);
      expect(fsMock.readFileSync.calls[0].args).to.eql([ fakeFilePath, 'utf8' ]);

      expect(testEnvironmentMakerMock.init.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.init.calls[0].args).to.eql([ fakeSyncFunctionContents, fakeFilePath ]);

      verifyTestEnvironment();
    });

    it('can initialize directly from document definitions', function() {
      syncFunctionLoaderMock.load.returnWith(fakeSyncFunctionContents);

      testHelper.initDocumentDefinitions(fakeFilePath);

      expect(syncFunctionLoaderMock.load.callCount).to.equal(1);
      expect(syncFunctionLoaderMock.load.calls[0].args).to.eql([ fakeFilePath ]);

      expect(testEnvironmentMakerMock.init.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.init.calls[0].args).to.eql([ fakeSyncFunctionContents, void 0 ]);

      verifyTestEnvironment();
    });

    function verifyTestEnvironment() {
      expect(testHelper.requireAccess).to.equal(fakeTestEnvironment.requireAccess);
      expect(testHelper.requireRole).to.equal(fakeTestEnvironment.requireRole);
      expect(testHelper.requireUser).to.equal(fakeTestEnvironment.requireUser);
      expect(testHelper.channel).to.equal(fakeTestEnvironment.channel);
      expect(testHelper.access).to.equal(fakeTestEnvironment.access);
      expect(testHelper.role).to.equal(fakeTestEnvironment.role);
      expect(testHelper.customActionStub).to.equal(fakeTestEnvironment.customActionStub);
      expect(testHelper.syncFunction).to.equal(fakeTestEnvironment.syncFunction);
    }
  });

  describe('when verifying that document authorization is denied', function() {
    beforeEach(function() {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if it encounters a required channel that was not expected', function() {
      var actualChannels = [ 'my-channel-1', 'my-channel-2' ];
      var expectedChannels = [ 'my-channel-1' ];

      testHelper.syncFunction = function() {
        testHelper.requireAccess(actualChannels);
      };

      expect(function() {
        testHelper.verifyAccessDenied({ }, void 0, expectedChannels);
      }).to.throw('Unexpected channel encountered: my-channel-2');
    });

    it('fails if it does not encounter a channel that was expected', function() {
      var actualChannels = [ 'my-channel-1' ];
      var expectedChannels = [ 'my-channel-1', 'my-channel-2' ];

      testHelper.syncFunction = function() {
        testHelper.requireAccess(actualChannels);
      };

      expect(function() {
        testHelper.verifyAccessDenied({ }, void 0, expectedChannels);
      }).to.throw('Expected channel was not encountered: my-channel-2');
    });

    it('fails if the sync function does not throw an error', function() {
      testHelper.syncFunction = function() { };

      expect(function() {
        testHelper.verifyAccessDenied({ }, void 0, [ ]);
      }).to.throw('Document authorization succeeded when it was expected to fail');
    });

    it('succeeds if there are no expected channels, roles or users allowed', function() {
      testHelper.syncFunction = function() {
        testHelper.requireAccess([ ]);
      };

      expect(function() {
        testHelper.verifyAccessDenied({ }, void 0, { });
      }).not.to.throw();
    });
  });

  describe('when verifying that a document type is unknown', function() {
    beforeEach(function() {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if the document type is recognized', function() {
      testHelper.syncFunction = function() { };

      expect(function() {
        testHelper.verifyUnknownDocumentType({ });
      }).to.throw('Document type was successfully identified when it was expected to be unknown');
    });
  });

  describe('when verifying that document contents are invalid', function() {
    beforeEach(function() {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if the sync function does not throw an error', function() {
      testHelper.syncFunction = function() { };

      expect(function() {
        testHelper.verifyDocumentRejected({ }, void 0, 'my-doc-type', [ ], { });
      }).to.throw('Document validation succeeded when it was expected to fail');
    });

    it('fails if the validation error message format is invalid', function() {
      var errorMessage = 'Foo: bar';

      testHelper.syncFunction = function() {
        throw { forbidden: errorMessage };
      };

      expect(function() {
        testHelper.verifyDocumentRejected({ }, void 0, 'my-doc-type', [ ], { });
      }).to.throw('Unrecognized document validation error message format: "' + errorMessage + '"');
    });

    it('fails if an expected validation error is missing', function() {
      var docType = 'my-doc-type';
      var expectedErrors = [ 'my-error-1', 'my-error-2' ];
      var errorMessage = 'Invalid ' + docType + ' document: ' + expectedErrors[0];

      testHelper.syncFunction = function() {
        throw { forbidden: errorMessage };
      };

      expect(function() {
        testHelper.verifyDocumentRejected({ }, void 0, docType, expectedErrors, { });
      }).to.throw('Document validation errors do not include expected error message: "' + expectedErrors[1] + '". Actual error: ' + errorMessage);
    });

    it('fails if an unexpected validation error is encountered', function() {
      var docType = 'my-doc-type';
      var actualErrors = [ 'my-error-1', 'my-error-2' ];
      var expectedErrors = [ actualErrors[0] ];
      var errorMessage = 'Invalid ' + docType + ' document: ' + actualErrors[0] + '; ' + actualErrors[1];

      testHelper.syncFunction = function() {
        throw { forbidden: errorMessage };
      };

      expect(function() {
        testHelper.verifyDocumentRejected({ }, void 0, docType, expectedErrors, { });
      }).to.throw('Unexpected document validation error: "' + actualErrors[1] + '"');
    });
  });

  describe('when verifying that document contents are correct', function() {
    beforeEach(function() {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if the channel assignment function was not called', function() {
      testHelper.syncFunction = function() {
        testHelper.requireAccess([ ]);
      };

      expect(function() {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ]);
      }).to.throw('Document channels were not assigned');
    });
  });

  describe('when verifying access assignments', function() {
    beforeEach(function() {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if a different set of channel access is assigned than what was expected', function() {
      var actualChannels = [ 'my-channel-1' ];
      var expectedChannelAccessAssignment = {
        expectedType: 'channel',
        expectedRoles: [ 'my-role-1' ],
        foo: [ 'bar' ] // This should be ignored
      };
      var expectedEffectiveRoles = expectedChannelAccessAssignment.expectedRoles.map(function(role) { return 'role:' + role; });

      testHelper.syncFunction = function() {
        testHelper.access(expectedEffectiveRoles, actualChannels);
      };

      expect(function() {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ], [ expectedChannelAccessAssignment ]);
      }).to.throw('Missing expected call to assign channel access (' +
        JSON.stringify([ ]) +
        ') to users and roles (' +
        JSON.stringify(expectedEffectiveRoles) +
        ')');
    });

    it('fails if a different set of role access is assigned than what was expected', function() {
      var expectedRoleAccessAssignment = {
        expectedType: 'role',
        expectedRoles: [ 'my-role-1', 'my-role-2' ],
        expectedUsers: [ 'my-user-1', 'my-user-2', 'my-user-3' ]
      };
      var expectedEffectiveRoles = expectedRoleAccessAssignment.expectedRoles.map(function(role) { return 'role:' + role; });
      var actualUsers = [ 'my-user-1', 'my-user-2', 'my-user-2' ];

      testHelper.syncFunction = function() {
        testHelper.role(actualUsers, expectedEffectiveRoles);
      };

      expect(function() {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ], [ expectedRoleAccessAssignment ]);
      }).to.throw(
        'Missing expected call to assign role access (' +
        JSON.stringify(expectedEffectiveRoles) +
        ') to users (' +
        JSON.stringify(expectedRoleAccessAssignment.expectedUsers) +
        ')');
    });

    it('fails if there is a call to assign channel access when none is expected', function() {
      testHelper.syncFunction = function() {
        testHelper.access();
      };

      expect(function() {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ], [ ]);
      }).to.throw('Number of calls to assign channel access (1) does not match expected (0)');
    });

    it('fails if there is a call to assign role access when none is expected', function() {
      testHelper.syncFunction = function() {
        testHelper.role();
      };

      expect(function() {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ], [ ]);
      }).to.throw('Number of calls to assign role access (1) does not match expected (0)');
    });

    it('fails if there is an unrecognized access assignment type', function() {
      var expectedInvalidAccessAssignment = {
        expectedType: 'invalid-type',
        expectedRoles: [ 'my-role-1' ],
        expectedUsers: [ 'my-user-1' ]
      };

      testHelper.syncFunction = function() { };

      expect(function() {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ], [ expectedInvalidAccessAssignment ]);
      }).to.throw('Unrecognized expected access assignment type ("' + expectedInvalidAccessAssignment.expectedType + '")');
    });
  });
});
