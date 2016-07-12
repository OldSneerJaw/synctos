{
  immutableItemsDoc: {
    channels: { write: 'write' },
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
