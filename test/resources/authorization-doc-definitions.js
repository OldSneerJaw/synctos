{
  explicitChannelsDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: [ 'replace', 'update' ],
      remove: [ 'remove', 'delete' ]
    },
    typeFilter: function(doc) {
      return doc._id === 'explicitChannelsDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  writeOnlyChannelsDoc: {
    channels: {
      write: [ 'edit', 'modify', 'write' ]
    },
    typeFilter: function(doc) {
      return doc._id === 'writeOnlyChannelsDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  dynamicChannelsAndRolesDoc: {
    typeFilter: function(doc) {
      return doc._id === 'dynamicChannelsAndRolesDoc';
    },
    channels: function(doc, oldDoc) {
      return {
        view: doc._id + '-view',
        write: doc._id + '-write'
      };
    },
    authorizedRoles: function(doc, oldDoc) {
      return { write: oldDoc ? oldDoc.roles : doc.roles };
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      },
      roles: {
        type: 'array'
      }
    }
  },
  noChannelsAndStaticRolesDoc: {
    typeFilter: function(doc) {
      return doc._id === 'noChannelsAndStaticRolesDoc';
    },
    authorizedRoles: {
      add: [ 'add' ],
      replace: 'replace',
      remove: 'remove'
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  noAuthorizationsDefinedDoc: {
    typeFilter: function(doc) {
      return doc._id === 'noAuthorizationsDefinedDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  }
}
