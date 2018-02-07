var expect = require('chai').expect;
var testHelper = require('../src/testing/test-helper.js');

describe('User and role access assignment:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-access-assignment-sync-function.js');
  });

  describe('Static assignment of channels to users and roles', function() {
    var expectedStaticAssignments = [
      {
        expectedType: 'channel',
        expectedUsers: [ 'user2', 'user1', 'user4' ],
        expectedRoles: [ 'role2', 'role1' ],
        expectedChannels: [ 'channel1', 'channel2' ]
      },
      {
        expectedType: 'channel',
        expectedUsers: 'user3',
        expectedChannels: 'channel3'
      },
      {
        expectedType: 'channel',
        expectedRoles: 'role3',
        expectedChannels: 'channel4'
      },
      {
        expectedType: 'role',
        expectedUsers: 'user5',
        expectedRoles: 'role4'
      }
    ];

    it('is applied when creating a valid document', function() {
      var doc = { _id: 'staticAccessDoc' };

      testHelper.verifyDocumentCreated(doc, 'write', expectedStaticAssignments);
    });

    it('is applied when replacing an existing valid document', function() {
      var doc = { _id: 'staticAccessDoc' };
      var oldDoc = { _id: 'staticAccessDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc, 'write', expectedStaticAssignments);
    });

    it('is applied when deleting an existing document', function() {
      var oldDoc = { _id: 'staticAccessDoc' };

      testHelper.verifyDocumentDeleted(oldDoc, 'write', expectedStaticAssignments);
    });

    it('is NOT applied when creating an invalid document', function() {
      var doc = {
        _id: 'staticAccessDoc',
        invalidProperty: 'foobar'
      };

      expect(function() {
        testHelper.syncFunction(doc);
      }).to.throw();
      expect(testHelper.access.callCount).to.equal(0);
    });

    it('is NOT applied when replacing an invalid document', function() {
      var doc = {
        _id: 'staticAccessDoc',
        invalidProperty: 'foobar'
      };
      var oldDoc = { _id: 'staticAccessDoc' };

      expect(function() {
        testHelper.syncFunction(doc, oldDoc);
      }).to.throw();
      expect(testHelper.access.callCount).to.equal(0);
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
        expectedType: 'channel',
        expectedUsers: doc.users,
        expectedRoles: doc.roles,
        expectedChannels: [ doc._id + '-channel1', doc._id + '-channel2' ]
      },
      {
        expectedType: 'channel',
        expectedUsers: doc.users,
        expectedChannels: [ doc._id + '-channel3' ]
      },
      {
        expectedType: 'channel',
        expectedRoles: doc.roles,
        expectedChannels: [ doc._id + '-channel4' ]
      },
      {
        expectedType: 'role',
        expectedUsers: doc.users,
        expectedRoles: doc.roles
      }
    ];

    it('is applied when creating a valid document', function() {
      testHelper.verifyDocumentCreated(doc, 'write', expectedDynamicAssignments);
    });

    it('is applied when replacing a deleted document', function() {
      var oldDoc = {
        _id: 'dynamicAccessDoc',
        _deleted: true
      };

      // The access assignment functions for this document type are set up to return different values if they receive an oldDoc parameter
      // that has _deleted set to true. However, that should never happen because the sync function template is supposed to replace such
      // cases with a null value. This test verifies that replacement occurs as expected.
      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write', expectedDynamicAssignments);
    });

    it('is applied when replacing an existing valid document', function() {
      var oldDoc = { _id: 'dynamicAccessDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc, 'write', expectedDynamicAssignments);
    });

    it('is applied when deleting an existing document', function() {
      var oldDoc = { _id: 'dynamicAccessDoc' };

      var expectedDeleteAssignments = [
        {
          expectedType: 'channel',
          expectedUsers: null,
          expectedChannels: [ doc._id + '-channel3' ]
        },
        {
          expectedType: 'channel',
          expectedRoles: null,
          expectedChannels: [ doc._id + '-channel4' ]
        },
        {
          expectedType: 'channel',
          expectedUsers: null,
          expectedRoles: null,
          expectedChannels: [ doc._id + '-channel2', doc._id + '-channel1' ]
        },
        {
          expectedType: 'role',
          expectedUsers: null,
          expectedRoles: null
        }
      ];

      testHelper.verifyDocumentDeleted(oldDoc, 'write', expectedDeleteAssignments);
    });

    it('is NOT applied when creating an invalid document', function() {
      var doc = {
        _id: 'dynamicAccessDoc',
        users: [ 'user1' ],
        roles: [ 'role1' ],
        invalidProperty: 'foobar'
      };

      expect(function() {
        testHelper.syncFunction(doc);
      }).to.throw();
      expect(testHelper.access.callCount).to.equal(0);
    });

    it('is NOT applied when replacing an invalid document', function() {
      var doc = {
        _id: 'dynamicAccessDoc',
        users: [ 'user1' ],
        roles: [ 'role1' ],
        invalidProperty: 'foobar'
      };
      var oldDoc = { _id: 'dynamicAccessDoc' };

      expect(function() {
        testHelper.syncFunction(doc, oldDoc);
      }).to.throw();
      expect(testHelper.access.callCount).to.equal(0);
    });
  });
});
