{
  staticAccessDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'staticAccessDoc';
    },
    propertyValidators: { },
    accessAssignments: [
      {
        type: 'channel',
        users: 'user3',
        channels: 'channel3'
      },
      {
        type: 'channel',
        roles: 'role3',
        channels: 'channel4'
      },
      {
        // With no "type" property defined, it should default to channel access assignment
        users: [ 'user1', 'user2', 'user4' ],
        roles: [ 'role1', 'role2' ],
        channels: [ 'channel1', 'channel2' ]
      },
      {
        type: 'role',
        users: 'user5',
        roles: 'role4'
      }
    ]
  },
  dynamicAccessEntryItemsDoc: {
    typeFilter: function(doc, oldDoc, docType) {
      return doc._id === docType;
    },
    channels: { write: 'write' },
    propertyValidators: {
      users: {
        type: 'array'
      },
      roles: {
        type: 'array'
      }
    },
    accessAssignments: [
      {
        type: 'role',
        users: function(doc, oldDoc) { return doc.users; },
        roles: function(doc, oldDoc) { return doc.roles; }
      },
      {
        type: 'channel',
        // The sync function template should automatically replace the oldDoc param value with null if its _deleted property is true
        users: function(doc, oldDoc) {
          return (oldDoc && oldDoc._deleted) ? 'this-should-never-happen' : doc.users;
        },
        roles: function(doc, oldDoc) {
          return (oldDoc && oldDoc._deleted) ? 'this-should-never-happen' : doc.roles;
        },
        channels: function(doc, oldDoc) {
          return (oldDoc && oldDoc._deleted) ? 'this-should-never-happen' : [ doc._id + '-channel1', doc._id + '-channel2' ];
        }
      },
      {
        // With a null "type" property defined, it should default to channel access assignment
        type: null,
        roles: function(doc, oldDoc) { return doc.roles; },
        channels: function(doc, oldDoc) { return doc._id + '-channel4'; }
      },
      {
        // With no "type" property defined, it should default to channel access assignment
        users: function(doc, oldDoc) { return doc.users; },
        channels: function(doc, oldDoc) { return doc._id + '-channel3'; }
      }
    ]
  },
  dynamicAccessConstraintDoc: {
    typeFilter: function(doc, oldDoc, docType) {
      return doc._id === docType;
    },
    channels: { write: [ 'write' ] },
    propertyValidators: {
      users: {
        type: 'array'
      },
      roles: {
        type: 'array'
      }
    },
    accessAssignments: function(doc, oldDoc) {
      return [
        {
          type: 'role',
          users: doc.users,
          roles: doc.roles
        },
        {
          type: 'channel',
          // The sync function template should automatically replace the oldDoc param value with null if its _deleted property is true
          users: (oldDoc && oldDoc._deleted) ? 'this-should-never-happen' : doc.users,
          roles: (oldDoc && oldDoc._deleted) ? 'this-should-never-happen' : doc.roles,
          channels: (oldDoc && oldDoc._deleted) ? 'this-should-never-happen' : [ doc._id + '-channel1', doc._id + '-channel2' ]
        },
        {
          // With no "type" property defined, it should default to channel access assignment
          roles: doc.roles,
          channels: doc._id + '-channel4'
        },
        {
          // With a null "type" property defined, it should default to channel access assignment
          type: null,
          users: doc.users,
          channels: doc._id + '-channel3'
        }
      ];
    }
  }
}
