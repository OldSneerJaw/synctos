{
  myDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'myDoc';
    },
    propertyValidators: {
      staticValidationProp: {
        type: 'string',
        immutableWhenSet: true
      },
      dynamicPropertiesAreImmutable: {
        type: 'boolean'
      },
      dynamicValidationProp: {
        type: 'integer',
        immutableWhenSet: function(doc, oldDoc, value, oldValue) {
          return doc.dynamicPropertiesAreImmutable;
        }
      }
    }
  }
}
