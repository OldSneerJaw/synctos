var testHelper = require('../etc/test-helper.js');

describe('Channel assignment:', function() {

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-authorization-sync-function.js');
  });

  describe('for a document with explicit channel definitions', function() {
    var allChannels = [ 'add', 'update', 'replace', 'view', 'delete', 'remove' ];

    it('includes all configured channels when assigning channels to a new document', function() {
      var doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyDocumentCreated(doc, 'add');
      testHelper.verifyChannelAssignment(allChannels);
    });

    it('includes all configured channels when assigning channels to a replaced document', function() {
      var doc = { _id: 'explicitChannelsDoc', stringProp: 'foobaz' };
      var oldDoc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyDocumentReplaced(doc, oldDoc, [ 'replace', 'update' ]);
      testHelper.verifyChannelAssignment(allChannels);
    });

    it('includes all configured channels when assigning channels to a deleted document', function() {
      var doc = { _id: 'explicitChannelsDoc', _deleted: true };

      testHelper.verifyDocumentDeleted(doc, [ 'remove', 'delete' ]);
      testHelper.verifyChannelAssignment(allChannels);
    });
  });

  describe('for a document with only the write channels defined', function() {
    var writeChannels = [ 'edit', 'modify', 'write' ];

    it('includes all configured channels when assigning channels to a new document', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyDocumentCreated(doc, writeChannels);
      testHelper.verifyChannelAssignment(writeChannels);
    });

    it('includes all configured channels when assigning channels to a replaced document', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobaz' };
      var oldDoc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyDocumentReplaced(doc, oldDoc, writeChannels);
      testHelper.verifyChannelAssignment(writeChannels);
    });

    it('includes all configured channels when assigning channels to a deleted document', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', _deleted: true };

      testHelper.verifyDocumentDeleted(doc, writeChannels);
      testHelper.verifyChannelAssignment(writeChannels);
    });
  });

  describe('for a document with dynamically-assigned roles and channels', function() {
    var allExpectedChannels = [ 'dynamicChannelsAndRolesDoc-write', 'dynamicChannelsAndRolesDoc-view' ];
    var expectedWriteChannels = [ 'dynamicChannelsAndRolesDoc-write' ];
    var expectedWriteRoles = [ 'write1', 'write2' ];
    var expectedAuthorization = {
      expectedChannels: expectedWriteChannels,
      expectedRoles: expectedWriteRoles
    };

    it('includes all configured channels when assigning channels to a new document', function() {
      var doc = {
        _id: 'dynamicChannelsAndRolesDoc',
        stringProp: 'foobar',
        roles: expectedWriteRoles
      };

      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      testHelper.verifyChannelAssignment(allExpectedChannels);
    });

    it('includes all configured channels when assigning channels to a replaced document', function() {
      var doc = {
        _id: 'dynamicChannelsAndRolesDoc',
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'dynamicChannelsAndRolesDoc',
        roles: expectedWriteRoles
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      testHelper.verifyChannelAssignment(allExpectedChannels);
    });

    it('includes all configured channels when assigning channels to a deleted document', function() {
      var oldDoc = {
        _id: 'dynamicChannelsAndRolesDoc',
        roles: expectedWriteRoles
      };

      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      testHelper.verifyChannelAssignment(allExpectedChannels);
    });
  });

  describe('for a document with statically-assigned roles and no channels', function() {
    it('includes all configured channels when assigning channels to a new document', function() {
      var doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentCreated(doc, { expectedRoles: [ 'add' ] });
      testHelper.verifyChannelAssignment([ ]);
    });

    it('includes all configured channels when assigning channels to a replaced document', function() {
      var doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc, { expectedRoles: 'replace' });
      testHelper.verifyChannelAssignment([ ]);
    });

    it('includes all configured channels when assigning channels to a deleted document', function() {
      var oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testHelper.verifyDocumentDeleted(oldDoc, { expectedRoles: 'remove' });
      testHelper.verifyChannelAssignment([ ]);
    });
  });
});
