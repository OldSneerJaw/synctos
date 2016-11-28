var testHelper = require('../etc/test-helper.js');

describe('Authorization:', function() {

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-authorization-sync-function.js');
  });

  describe('for a document with explicit channel definitions', function() {
    it('rejects document creation for a user with no matching channels', function() {
      var doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyAccessDenied(doc, undefined, 'add');
    });

    it('rejects document replacement for a user with no matching channels', function() {
      var doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };
      var oldDoc = { _id: 'explicitChannelsDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, [ 'replace', 'update' ]);
    });

    it('rejects document deletion for a user with no matching channels', function() {
      var doc = { _id: 'explicitChannelsDoc', _deleted: true };

      testHelper.verifyAccessDenied(doc, undefined, [ 'remove', 'delete' ]);
    });
  });

  describe('for a document with only the write channels defined', function() {
    var writeChannels = [ 'edit', 'modify', 'write' ];

    it('rejects document creation for a user with no matching channels', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyAccessDenied(doc, undefined, writeChannels);
    });

    it('rejects document replacement for a user with no matching channels', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };
      var oldDoc = { _id: 'writeOnlyChannelsDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, writeChannels);
    });

    it('rejects document deletion for a user with no matching channels', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', _deleted: true };

      testHelper.verifyAccessDenied(doc, undefined, writeChannels);
    });
  });

  describe('for a document with dynamically-assigned roles and channels', function() {
    var expectedWriteChannels = [ 'dynamicChannelsAndRolesDoc-write' ];
    var expectedWriteRoles = [ 'write1', 'write2' ];
    var expectedAuthorization = {
      expectedChannels: expectedWriteChannels,
      expectedRoles: expectedWriteRoles
    };

    it('rejects document creation for a user with no matching channels or roles', function() {
      var doc = {
        _id: 'dynamicChannelsAndRolesDoc',
        stringProp: 'foobar',
        roles: expectedWriteRoles
      };

      testHelper.verifyAccessDenied(doc, null, expectedAuthorization);
    });

    it('rejects document replacement for a user with no matching channels or roles', function() {
      var doc = {
        _id: 'dynamicChannelsAndRolesDoc',
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'dynamicChannelsAndRolesDoc',
        roles: expectedWriteRoles
      };

      testHelper.verifyAccessDenied(doc, oldDoc, expectedAuthorization);
    });

    it('rejects document deletion for a user with no matching channels or roles', function() {
      var doc = {
        _id: 'dynamicChannelsAndRolesDoc',
        _deleted: true
      };
      var oldDoc = {
        _id: 'dynamicChannelsAndRolesDoc',
        roles: expectedWriteRoles
      };

      testHelper.verifyAccessDenied(doc, oldDoc, expectedAuthorization);
    });
  });

  describe('for a document with statically-assigned roles and no channels', function() {
    it('rejects document creation for a user with no matching roles', function() {
      var doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyAccessDenied(doc, null, { expectedRoles: [ 'add' ] });
    });

    it('rejects document replacement for a user with no matching roles', function() {
      var doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { expectedRoles: [ 'replace' ] });
    });

    it('rejects document deletion for a user with no matching roles', function() {
      var doc = {
        _id: 'noChannelsAndStaticRolesDoc',
        _deleted: true
      };
      var oldDoc = {
        _id: 'noChannelsAndStaticRolesDoc'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { expectedRoles: [ 'remove' ] });
    });
  });

  describe('for a document that does not define any authorized channels, roles or users', function() {
    it('rejects document creation', function() {
      var doc = {
        _id: 'noAuthorizationsDefinedDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyAccessDenied(doc, null, { });
    });

    it('rejects document replacement', function() {
      var doc = {
        _id: 'noAuthorizationsDefinedDoc',
        stringProp: 'foobar'
      };
      var oldDoc = {
        _id: 'noAuthorizationsDefinedDoc'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { });
    });

    it('rejects document deletion', function() {
      var doc = {
        _id: 'noAuthorizationsDefinedDoc',
        _deleted: true
      };
      var oldDoc = {
        _id: 'noAuthorizationsDefinedDoc'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { });
    });
  });
});
