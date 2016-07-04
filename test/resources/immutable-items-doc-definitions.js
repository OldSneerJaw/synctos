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
    propertyValidators: {
      immutableArrayProp: {
        type: 'array',
        immutable: true
      },
      immutableObjectProp: {
        type: 'object',
        immutable: true
      },
      immutableHashtableProp: {
        type: 'hashtable',
        immutable: true
      }
    }
  }
}
