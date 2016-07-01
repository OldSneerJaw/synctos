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
        propertyName: 'arrayProp',
        type: 'array'
      },
      {
        propertyName: 'objectProp',
        type: 'object'
      },
      {
        propertyName: 'hashtableProp',
        type: 'hashtable'
      },
      {
        propertyName: 'stringProp',
        type: 'string'
      }
    ],
    allowAttachments: true,
    immutable: true
  }
}
