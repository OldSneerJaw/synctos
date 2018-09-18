const { expect } = require('chai');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Test environment authorization:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-test-environment-auth-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  it('should stub calls to requireAccess', function() {
    const doc = {
      _id: 'my-doc',
      type: 'requireAccessDoc',
      text: 'foobar'
    };

    testFixture.testEnvironment.syncFunction(doc, null);

    expect(testFixture.testEnvironment.requireAccess.callCount).to.equal(1);
    expect(testFixture.testEnvironment.requireAccess.calls[0].args).to.deep.equal([ 'channel1' ]);
  });

  it('should stub calls to requireAdmin', function() {
    const doc = {
      _id: 'my-doc',
      type: 'requireAdminDoc',
      text: 'foobar'
    };

    testFixture.testEnvironment.syncFunction(doc, null);

    expect(testFixture.testEnvironment.requireAdmin.callCount).to.equal(1);
    expect(testFixture.testEnvironment.requireAdmin.calls[0].args).to.deep.equal([ ]);
  });

  it('should stub calls to requireRole', function() {
    const doc = {
      _id: 'my-doc',
      type: 'requireRoleDoc',
      text: 'foobar'
    };

    testFixture.testEnvironment.syncFunction(doc, null);

    expect(testFixture.testEnvironment.requireRole.callCount).to.equal(1);
    expect(testFixture.testEnvironment.requireRole.calls[0].args).to.deep.equal([ 'role1' ]);
  });

  it('should stub calls to requireUser', function() {
    const doc = {
      _id: 'my-doc',
      type: 'requireUserDoc',
      text: 'foobar'
    };

    testFixture.testEnvironment.syncFunction(doc, null);

    expect(testFixture.testEnvironment.requireUser.callCount).to.equal(1);
    expect(testFixture.testEnvironment.requireUser.calls[0].args).to.deep.equal([ 'user1' ]);
  });
});
