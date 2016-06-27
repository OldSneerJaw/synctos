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
        propertyName: 'immutableArrayProp',
        type: 'array',
        immutable: true
      },
      {
        propertyName: 'immutableObjectProp',
        type: 'object',
        immutable: true
      },
      {
        propertyName: 'immutableHashtableProp',
        type: 'hashtable',
        immutable: true
      }
    ]
  }
}
