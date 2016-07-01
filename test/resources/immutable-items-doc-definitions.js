{
  immutableItemsDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'immutableItemsDoc';
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
