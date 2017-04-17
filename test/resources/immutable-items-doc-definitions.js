function() {
  function isImmutable(value, oldValue, doc, oldDoc) {
    return oldDoc ? oldDoc.dynamicPropertiesAreImmutable : doc.dynamicPropertiesAreImmutable;
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
          immutable: true
        },
        staticImmutableObjectProp: {
          type: 'object',
          immutable: true
        },
        staticImmutableHashtableProp: {
          type: 'hashtable',
          immutable: true
        },
        dynamicPropertiesAreImmutable: {
          type: 'boolean',
          immutable: true
        },
        dynamicImmutableArrayProp: {
          type: 'array',
          immutable: isImmutable
        },
        dynamicImmutableObjectProp: {
          type: 'object',
          immutable: isImmutable
        },
        dynamicImmutableHashtableProp: {
          type: 'hashtable',
          immutable: isImmutable
        }
      }
    }
  };
}
