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
  }
}
