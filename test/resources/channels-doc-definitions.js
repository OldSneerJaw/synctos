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
  }
}
