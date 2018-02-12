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
      staticImmutableDateProp: {
        type: 'date',
        immutableStrict: true
      },
      staticImmutableDatetimeProp: {
        type: 'datetime',
        immutableStrict: true
      },
      staticImmutableTimeProp: {
        type: 'time',
        immutableStrict: true
      },
      staticImmutableTimezoneProp: {
        type: 'timezone',
        immutableStrict: true
      },
      staticImmutableUuidProp: {
        type: 'uuid',
        immutableStrict: true
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
