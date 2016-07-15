{
  myDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'myDoc';
    },
    propertyValidators: {
      myProp: {
        type: 'string',
        immutableIfSet: true
      }
    }
  }
}
