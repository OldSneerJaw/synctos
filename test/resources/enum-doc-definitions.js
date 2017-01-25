{
  enumDoc: {
    typeFilter: function(doc, oldDoc) {
      return doc._id === 'enumDoc';
    },
    channels: { write: 'write' },
    propertyValidators: {
      enumProp: {
        type: 'enum',
        predefinedValues: [ 'value1', 2 ]
      },
      invalidEnumProp: {
        type: 'enum'
      }
    }
  }
}
