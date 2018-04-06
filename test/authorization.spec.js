const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Authorization:', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-authorization-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('for a document with explicit channel definitions', () => {
    it('rejects document creation for a user with no matching channels', () => {
      const doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testFixture.verifyAccessDenied(doc, void 0, 'add');
    });

    it('rejects document replacement for a user with no matching channels', () => {
      const doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'explicitChannelsDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, [ 'replace', 'update' ]);
    });

    it('rejects document deletion for a user with no matching channels', () => {
      const doc = { _id: 'explicitChannelsDoc', _deleted: true };

      testFixture.verifyAccessDenied(doc, void 0, { expectedChannels: [ 'remove', 'delete' ] });
    });
  });

  describe('for a document with only the write channels defined', () => {
    const writeChannels = [ 'edit', 'modify', 'write' ];

    it('rejects document creation for a user with no matching channels', () => {
      const doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testFixture.verifyAccessDenied(doc, void 0, writeChannels);
    });

    it('rejects document replacement for a user with no matching channels', () => {
      const doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'writeOnlyChannelsDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, writeChannels);
    });

    it('rejects document deletion for a user with no matching channels', () => {
      const doc = { _id: 'writeOnlyChannelsDoc', _deleted: true };

      testFixture.verifyAccessDenied(doc, void 0, writeChannels);
    });
  });

  describe('for a document with write channels and an explicit add channel defined', () => {
    it('allows document addition for a user with only the add channel', () => {
      const doc = { _id: 'writeAndAddChannelsDoc' };

      testFixture.verifyDocumentCreated(doc, [ 'edit', 'add' ]);
    });

    it('rejects document replacement for a user with only the add channel', () => {
      const doc = {
        _id: 'writeAndAddChannelsDoc',
        stringProp: 'foobar'
      };
      const oldDoc = { _id: 'writeAndAddChannelsDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, 'edit');
    });

    it('rejects document deletion for a user with only the add channel', () => {
      const doc = {
        _id: 'writeAndAddChannelsDoc',
        _deleted: true
      };
      const oldDoc = { _id: 'writeAndAddChannelsDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, 'edit');
    });
  });

  describe('for a document with dynamically-assigned roles, channels and users', () => {
    const expectedWriteChannels = [ 'dynamicChannelsRolesAndUsersDoc-write' ];
    const expectedWriteRoles = [ 'write-role1', 'write-role2' ];
    const expectedWriteUsers = [ 'write-user1', 'write-user2' ];
    const expectedAuthorization = {
      expectedChannels: expectedWriteChannels,
      expectedRoles: expectedWriteRoles,
      expectedUsers: expectedWriteUsers
    };

    it('rejects document creation for a user with no matching channels, roles or users', () => {
      const doc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        stringProp: 'foobar',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testFixture.verifyAccessDenied(doc, null, expectedAuthorization);
    });

    it('rejects document replacement for a user with no matching channels, roles or users', () => {
      const doc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testFixture.verifyAccessDenied(doc, oldDoc, expectedAuthorization);
    });

    it('rejects document deletion for a user with no matching channels, roles or users', () => {
      const doc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testFixture.verifyAccessDenied(doc, oldDoc, expectedAuthorization);
    });
  });

  describe('for a document with statically-assigned roles and no channels', () => {
    it('rejects document creation for a user with no matching roles', () => {
      const doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, null, { expectedRoles: [ 'add' ] });
    });

    it('rejects document replacement for a user with no matching roles', () => {
      const doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, { expectedRoles: [ 'replace' ] });
    });

    it('rejects document deletion for a user with no matching roles', () => {
      const doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, { expectedRoles: [ 'remove' ] });
    });
  });

  describe('for a document with statically-assigned users and no channels', () => {
    it('rejects document creation for a user without a matching username', () => {
      const doc = {
        _id: 'noChannelsAndStaticUsersDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, null, { expectedUsers: [ 'add1', 'add2' ] });
    });

    it('rejects document replacement for a user without a matching username', () => {
      const doc = {
        _id: 'noChannelsAndStaticUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'noChannelsAndStaticUsersDoc'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, { expectedUsers: [ 'replace1', 'replace2' ] });
    });

    it('rejects document deletion for a user without a matching username', () => {
      const doc = {
        _id: 'noChannelsAndStaticUsersDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'noChannelsAndStaticUsersDoc'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, { expectedUsers: [ 'remove1', 'remove2' ] });
    });
  });

  describe('for a document with statically-assigned replace role and nothing else', () => {
    it('rejects document creation', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, null, []);
    });

    it('allows document replacement', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'barfoo'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc, { expectedRoles: [ 'replace' ] });
    });

    it('rejects document deletion for a user with only replace role', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, []);
    });
  });

  describe('for a document with statically-assigned add role and nothing else', () => {
    it('allows document creation', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyDocumentCreated(doc, { expectedRoles: [ 'add' ] });
    });

    it('rejects document replacement', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'barfoo'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, []);
    });

    it('rejects document deletion for a user with only add role', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, []);
    });
  });
});
