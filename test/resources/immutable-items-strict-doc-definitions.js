function() {
  function isImmutable(doc, oldDoc, value, oldValue) {
    return doc.dynamicPropertiesAreImmutable;
  }

  return {
    immutableItemsDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'immutableItemsDoc';
      },
      propertyValidators: {
        staticImmutableArrayProp: {
          type: 'array',
          immutableStrict: true
        },
        staticImmutableObjectProp: {
          type: 'object',
          immutableStrict: true
        },
        staticImmutableHashtableProp: {
          type: 'hashtable',
          immutableStrict: true
        },
        dynamicPropertiesAreImmutable: {
          type: 'boolean'
        },
        dynamicImmutableArrayProp: {
          type: 'array',
          immutableStrict: isImmutable
        },
        dynamicImmutableObjectProp: {
          type: 'object',
          immutableStrict: isImmutable
        },
        dynamicImmutableHashtableProp: {
          type: 'hashtable',
          immutableStrict: isImmutable
        }
      }
    }
  };
}
