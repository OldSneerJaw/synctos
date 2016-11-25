var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');
var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

// Load the contents of the sync function file into a global variable called syncFunction
/*jslint evil: true */
eval('var syncFunction = ' + fs.readFileSync('build/sync-functions/test-access-assignment-sync-function.js').toString());
/*jslint evil: false */

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;
var access;

describe('User and role access assignment:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-access-assignment-sync-function.js');

    requireAccess = simple.stub();
    channel = simple.stub();
    access = simple.stub();
  });

  describe('Static assignment of channels to users and roles', function() {
    var expectedStaticAssignments = [
      {
        expectedUsers: [ 'user2', 'user1', 'user4' ],
        expectedRoles: [ 'role2', 'role1' ],
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

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(access.callCount).to.be(0);
      });
    });

    it('is NOT applied when replacing an invalid document', function() {
      var doc = {
        _id: 'staticAccessDoc',
        invalidProperty: 'foobar'
      };
      var oldDoc = { _id: 'staticAccessDoc' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(access.callCount).to.be(0);
      });
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
          expectedUsers: null,
          expectedChannels: [ doc._id + '-channel3' ]
        },
        {
          expectedRoles: null,
          expectedChannels: [ doc._id + '-channel4' ]
        },
        {
          expectedUsers: null,
          expectedRoles: null,
          expectedChannels: [ doc._id + '-channel2', doc._id + '-channel1' ]
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

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(access.callCount).to.be(0);
      });
    });

    it('is NOT applied when replacing an invalid document', function() {
      var doc = {
        _id: 'dynamicAccessDoc',
        users: [ 'user1' ],
        roles: [ 'role1' ],
        invalidProperty: 'foobar'
      };
      var oldDoc = { _id: 'dynamicAccessDoc' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(access.callCount).to.be(0);
      });
    });
  });
});
