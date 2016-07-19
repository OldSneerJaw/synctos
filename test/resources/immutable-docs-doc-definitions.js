{
  immutableDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'immutableDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    },
    immutable: true,
    allowAttachments: true
  },
  cannotReplaceDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'cannotReplaceDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    },
    cannotReplace: true,
    allowAttachments: true
  },
  cannotDeleteDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'cannotDeleteDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    },
    cannotDelete: true,
    allowAttachments: true
  }
}
