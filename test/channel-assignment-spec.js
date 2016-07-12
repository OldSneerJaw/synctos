var testHelper = require('../etc/test-helper.js');

describe('Channel assignment:', function() {

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-channels-sync-function.js');
  });

  describe('for a document with explicit channel definitions', function() {
    const allChannels = [ 'add', 'update', 'replace', 'view', 'delete', 'remove' ];

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
    const writeChannels = [ 'edit', 'modify', 'write' ];

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
});
