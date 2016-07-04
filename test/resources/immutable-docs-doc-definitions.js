{
  immutableDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'immutableDoc';
    },
    propertyValidators: [
      {
        propertyName: 'stringProp',
        type: 'string'
      }
    ],
    immutable: true,
    allowAttachments: true
  }
}
