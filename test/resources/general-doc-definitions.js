{
  generalDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: [ 'replace', 'update' ],
      remove: [ 'remove', 'delete' ]
    },
    typeFilter: function(doc) {
      return doc._id === 'generalDoc';
    },
    propertyValidators: {
      arrayProp: {
        type: 'array'
      },
      attachmentReferenceProp: {
        type: 'attachmentReference'
      },
      booleanProp: {
        type: 'boolean'
      },
      dateProp: {
        type: 'date'
      },
      datetimeProp: {
        type: 'datetime'
      },
      floatProp: {
        type: 'float'
      },
      hashtableProp: {
        type: 'hashtable'
      },
      integerProp: {
        type: 'integer'
      },
      objectProp: {
        type: 'object',
        propertyValidators: {
          foo: {
            type: 'string'
          }
        }
      },
      stringProp: {
        type: 'string'
      }
    }
  }
}
