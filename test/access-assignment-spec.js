var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('User and role access assignment:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-access-assignment-sync-function.js');
  });

  describe('Static assignment of channels to users and roles', function() {
    var expectedStaticAssignments = [
      {
        expectedUsers: [ 'user1', 'user2' ],
        expectedRoles: [ 'role1', 'role2' ],
        expectedChannels: [ 'channel1', 'channel2' ]
      },
      {
        expectedUsers: 'user3',
        expectedChannels: 'channel3'
      },
      {
        expectedRoles: 'role3',
        expectedChannels: 'channel4'
      }
    ];

    it('is applied when creating a document', function() {
      var doc = { _id: 'staticAccessDoc' };

      testHelper.verifyDocumentCreated(doc, 'write', expectedStaticAssignments);
    });

    it('is applied when replacing an existing document', function() {
      var doc = { _id: 'staticAccessDoc' };
      var oldDoc = { _id: 'staticAccessDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc, 'write', expectedStaticAssignments);
    });

    it('is applied when deleting an existing document', function() {
      var oldDoc = { _id: 'staticAccessDoc' };

      testHelper.verifyDocumentDeleted(oldDoc, 'write', expectedStaticAssignments);
    });
  });

  describe('Dynamic assignment of channels to users and roles', function() {
    var doc = {
      _id: 'dynamicAccessDoc',
      users: [ 'user1', 'user2' ],
      roles: [ 'role1', 'role2' ]
    };
    var expectedDynamicAssignments = [
      {
        expectedUsers: doc.users,
        expectedRoles: doc.roles,
        expectedChannels: [ doc._id + '-channel1', doc._id + '-channel2' ]
      },
      {
        expectedUsers: doc.users,
        expectedChannels: [ doc._id + '-channel3' ]
      },
      {
        expectedRoles: doc.roles,
        expectedChannels: [ doc._id + '-channel4' ]
      }
    ];

    it('is applied when creating a document', function() {
      testHelper.verifyDocumentCreated(doc, 'write', expectedDynamicAssignments);
    });

    it('is applied when replacing an existing document', function() {
      var oldDoc = { _id: 'dynamicAccessDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc, 'write', expectedDynamicAssignments);
    });

    it('is applied when deleting an existing document', function() {
      var oldDoc = { _id: 'dynamicAccessDoc' };

      var expectedDeleteAssignments = [
        {
          expectedUsers: null,
          expectedRoles: null,
          expectedChannels: [ doc._id + '-channel1', doc._id + '-channel2' ]
        },
        {
          expectedUsers: null,
          expectedChannels: [ doc._id + '-channel3' ]
        },
        {
          expectedRoles: null,
          expectedChannels: [ doc._id + '-channel4' ]
        }
      ];

      testHelper.verifyDocumentDeleted(oldDoc, 'write', expectedDeleteAssignments);
    });
  });
});
