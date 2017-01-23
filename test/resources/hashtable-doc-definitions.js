{
  hashtableDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'hashtableDoc';
    },
    propertyValidators: {
      sizeValidationProp: {
        type: 'hashtable',
        minimumSize: 2,
        maximumSize: 2
      }
    }
  }
}
