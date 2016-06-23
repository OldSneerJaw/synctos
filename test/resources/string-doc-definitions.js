{
  stringDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'stringDoc';
    },
    propertyValidators: [
      {
        propertyName: 'lengthValidationProp',
        type: 'string',
        minimumLength: 3,
        maximumLength: 3
      }
    ]
  }
}
