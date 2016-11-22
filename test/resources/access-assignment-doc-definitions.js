{
  staticAccessDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'staticAccessDoc';
    },
    accessAssignments: [
      {
        users: 'user3',
        channels: 'channel3'
      },
      {
        roles: 'role3',
        channels: 'channel4'
      },
      {
        users: [ 'user1', 'user2' ],
        roles: [ 'role1', 'role2' ],
        channels: [ 'channel1', 'channel2' ]
      }
    ]
  },
  dynamicAccessDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'dynamicAccessDoc';
    },
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
        users: function(doc, oldDoc) {
          return doc.users;
        },
        roles: function(doc, oldDoc) {
          return doc.roles;
        },
        channels: function(doc, oldDoc) {
          return [ doc._id + '-channel1', doc._id + '-channel2' ];
        }
      },
      {
        roles: function(doc, oldDoc) {
          return doc.roles;
        },
        channels: function(doc, oldDoc) {
          return doc._id + '-channel4';
        }
      },
      {
        users: function(doc, oldDoc) {
          return doc.users;
        },
        channels: function(doc, oldDoc) {
          return doc._id + '-channel3';
        }
      }
    ]
  }
}
