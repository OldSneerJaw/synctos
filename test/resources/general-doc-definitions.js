{
  generalDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'generalDoc';
    },
    propertyValidators: {
      objectProp: {
        type: 'object',
        propertyValidators: {
          foo: {
            type: 'string'
          }
        }
      }
    }
  }
}
