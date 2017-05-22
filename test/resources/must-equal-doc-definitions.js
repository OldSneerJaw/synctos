function() {
  function expectedArrayValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicArrayValue;
  }

  function expectedObjectValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicObjectValue;
  }

  function expectedHashtableValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicHashtableValue;
  }

  return {
    mustEqualDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'mustEqualDoc';
      },
      propertyValidators: {
        staticMustEqualArrayProp: {
          type: 'array',
          mustEqual: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
        }
      }
    }
  };
}
