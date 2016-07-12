{
  arrayDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'arrayDoc';
    },
    propertyValidators: {
      lengthValidationProp: {
        type: 'array',
        minimumLength: 2,
        maximumLength: 2,
        arrayElementsValidator: {
          type: 'string'
        }
      }
    }
  }
}
