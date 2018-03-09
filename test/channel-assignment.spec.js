const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Channel assignment:', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-authorization-sync-function.js');
  });

  describe('for a document with explicit channel definitions', () => {
    const allChannels = [ 'add', 'update', 'replace', 'view', 'delete', 'remove' ];

    it('includes all configured channels when assigning channels to a new document', () => {
      const doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testFixture.verifyDocumentCreated(doc, 'add');
      testFixture.verifyChannelAssignment(allChannels);
    });

    it('includes all configured channels when assigning channels to a replaced document', () => {
      const doc = { _id: 'explicitChannelsDoc', stringProp: 'foobaz' };
      const oldDoc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testFixture.verifyDocumentReplaced(doc, oldDoc, [ 'replace', 'update' ]);
      testFixture.verifyChannelAssignment(allChannels);
    });

    it('includes all configured channels when assigning channels to a deleted document', () => {
      const doc = { _id: 'explicitChannelsDoc', _deleted: true };

      testFixture.verifyDocumentDeleted(doc, [ 'remove', 'delete' ]);
      testFixture.verifyChannelAssignment(allChannels);
    });
  });

  describe('for a document with only the write channels defined', () => {
    const writeChannels = [ 'edit', 'modify', 'write' ];

    it('includes all configured channels when assigning channels to a new document', () => {
      const doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testFixture.verifyDocumentCreated(doc, writeChannels);
      testFixture.verifyChannelAssignment(writeChannels);
    });

    it('includes all configured channels when assigning channels to a replaced document', () => {
      const doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobaz' };
      const oldDoc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testFixture.verifyDocumentReplaced(doc, oldDoc, writeChannels);
      testFixture.verifyChannelAssignment(writeChannels);
    });

    it('includes all configured channels when assigning channels to a deleted document', () => {
      const doc = { _id: 'writeOnlyChannelsDoc', _deleted: true };

      testFixture.verifyDocumentDeleted(doc, writeChannels);
      testFixture.verifyChannelAssignment(writeChannels);
    });
  });

  describe('for a document with dynamically-assigned roles and channels', () => {
    const allExpectedChannels = [ 'dynamicChannelsRolesAndUsersDoc-write', 'dynamicChannelsRolesAndUsersDoc-view' ];
    const expectedWriteChannels = [ 'dynamicChannelsRolesAndUsersDoc-write' ];
    const expectedWriteRoles = [ 'write-role1', 'write-role2' ];
    const expectedWriteUsers = [ 'write-user1', 'write-user2' ];
    const expectedAuthorization = {
      expectedChannels: expectedWriteChannels,
      expectedRoles: expectedWriteRoles,
      expectedUsers: expectedWriteUsers
    };

    it('includes all configured channels when assigning channels to a new document', () => {
      const doc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        stringProp: 'foobar',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization);
      testFixture.verifyChannelAssignment(allExpectedChannels);
    });

    it('includes all configured channels when assigning channels to a replaced document', () => {
      const doc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      testFixture.verifyChannelAssignment(allExpectedChannels);
    });

    it('includes all configured channels when assigning channels to a deleted document', () => {
      const oldDoc = {
        _id: 'dynamicChannelsRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testFixture.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      testFixture.verifyChannelAssignment(allExpectedChannels);
    });
  });

  describe('for a document with statically-assigned roles and no channels', () => {
    it('includes all configured channels when assigning channels to a new document', () => {
      const doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyDocumentCreated(doc, { expectedRoles: 'add' });
      testFixture.verifyChannelAssignment([ ]);
    });

    it('includes all configured channels when assigning channels to a replaced document', () => {
      const doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc, { expectedRoles: 'replace' });
      testFixture.verifyChannelAssignment([ ]);
    });

    it('includes all configured channels when assigning channels to a deleted document', () => {
      const oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testFixture.verifyDocumentDeleted(oldDoc, { expectedRoles: 'remove' });
      testFixture.verifyChannelAssignment([ ]);
    });
  });

  describe('for a document with statically-assigned users and no channels', () => {
    it('includes all configured channels when assigning channels to a new document', () => {
      const doc = {
        _id: 'noChannelsAndStaticUsersDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyDocumentCreated(doc, { expectedUsers: [ 'add1', 'add2' ] });
      testFixture.verifyChannelAssignment([ ]);
    });

    it('includes all configured channels when assigning channels to a replaced document', () => {
      const doc = {
        _id: 'noChannelsAndStaticUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'noChannelsAndStaticUsersDoc'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc, { expectedUsers: [ 'replace1', 'replace2' ] });
      testFixture.verifyChannelAssignment([ ]);
    });

    it('includes all configured channels when assigning channels to a deleted document', () => {
      const oldDoc = {
        _id: 'noChannelsAndStaticUsersDoc'
      };

      testFixture.verifyDocumentDeleted(oldDoc, { expectedUsers: [ 'remove1', 'remove2' ] });
      testFixture.verifyChannelAssignment([ ]);
    });
  });
});
