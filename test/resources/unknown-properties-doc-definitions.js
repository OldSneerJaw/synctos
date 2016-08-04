{
  allowUnknownDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'allowUnknownDoc';
    },
    allowUnknownProperties: true,
    propertyValidators: {
      preventUnknownProp: {
        type: 'object',
        allowUnknownProperties: false,
        propertyValidators: {
          myStringProp: {
            type: 'string'
          }
        }
      }
    }
  },
  preventUnknownDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'preventUnknownDoc';
    },
    allowUnknownProperties: false,
    propertyValidators: {
      allowUnknownProp: {
        type: 'object',
        allowUnknownProperties: true,
        propertyValidators: {
          myStringProp: {
            type: 'string'
          }
        }
      }
    }
  }
}
