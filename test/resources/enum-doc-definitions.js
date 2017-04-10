{
  enumDoc: {
    typeFilter: function(doc, oldDoc) {
      return doc._id === 'enumDoc';
    },
    channels: { write: 'write' },
    propertyValidators: {
      staticEnumProp: {
        type: 'enum',
        predefinedValues: [ 'value1', 2 ]
      },
      invalidEnumProp: {
        type: 'enum'
      },
      dynamicPredefinedValues: {
        type: 'array'
      },
      dynamicEnumProp: {
        type: 'enum',
        predefinedValues: function(value, oldValue, doc, oldDoc) {
          return doc.dynamicPredefinedValues;
        }
      }
    }
  }
}
