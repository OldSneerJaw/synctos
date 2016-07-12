var testHelper = require('../etc/test-helper.js');

describe('Access control:', function() {

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-channels-sync-function.js');
  });

  describe('for a document with explicit channel definitions', function() {
    it('rejects document creation for a user without permission', function() {
      var doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyAccessDenied(doc, undefined, 'add');
    });

    it('rejects document replacement for a user without permission', function() {
      var doc = { _id: 'explicitChannelsDoc', stringProp: 'foobar' };
      var oldDoc = { _id: 'explicitChannelsDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, [ 'replace', 'update' ]);
    });

    it('rejects document deletion for a user without permission', function() {
      var doc = { _id: 'explicitChannelsDoc', _deleted: true };

      testHelper.verifyAccessDenied(doc, undefined, [ 'remove', 'delete' ]);
    });
  });

  describe('for a document with only the write channels defined', function() {
    var writeChannels = [ 'edit', 'modify', 'write' ];

    it('rejects document creation for a user without permission', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };

      testHelper.verifyAccessDenied(doc, undefined, writeChannels);
    });

    it('rejects document replacement for a user without permission', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', stringProp: 'foobar' };
      var oldDoc = { _id: 'writeOnlyChannelsDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, writeChannels);
    });

    it('rejects document deletion for a user without permission', function() {
      var doc = { _id: 'writeOnlyChannelsDoc', _deleted: true };

      testHelper.verifyAccessDenied(doc, undefined, writeChannels);
    });
  });
});
