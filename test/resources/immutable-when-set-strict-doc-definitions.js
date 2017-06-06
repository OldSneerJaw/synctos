{
  myDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'myDoc';
    },
    propertyValidators: {
      staticValidationProp: {
        type: 'string',
        immutableWhenSetStrict: true
      },
      dynamicPropertiesAreImmutable: {
        type: 'boolean'
      },
      dynamicValidationProp: {
        type: 'integer',
        immutableWhenSetStrict: function(doc, oldDoc, value, oldValue) {
          return doc.dynamicPropertiesAreImmutable;
        }
      }
    }
  }
}
