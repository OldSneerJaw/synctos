{
  arrayDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'arrayDoc';
    },
    propertyValidators: [
      {
        propertyName: 'lengthValidationProp',
        type: 'array',
        minimumLength: 2,
        maximumLength: 2,
        arrayElementsValidator: {
          type: 'string'
        }
      }
    ]
  }
}
