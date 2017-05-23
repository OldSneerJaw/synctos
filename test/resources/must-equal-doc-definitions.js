function() {
  var docChannels = { write: 'write' };

  function sharedTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  function getExpectedDynamicValue(doc, oldDoc, value, oldValue) {
    return doc.expectedDynamicValue;
  }

  return {
    staticArrayDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        arrayProp: {
          type: 'array',
          mustEqual: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
        }
      }
    },
    dynamicArrayDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        expectedDynamicValue: {
          type: 'array'
        },
        arrayProp: {
          type: 'array',
          mustEqual: getExpectedDynamicValue
        }
      }
    },
    staticObjectDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        objectProp: {
          type: 'object',
          mustEqual: {
            myStringProp: 'foobar',
            myIntegerProp: 8,
            myBooleanProp: true,
            myFloatProp: 88.92,
            myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
            myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
          }
        }
      }
    },
    dynamicObjectDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        expectedDynamicValue: {
          type: 'object'
        },
        objectProp: {
          type: 'object',
          mustEqual: getExpectedDynamicValue
        }
      }
    },
    staticHashtableDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        hashtableProp: {
          type: 'hashtable',
          mustEqual: {
            myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
            myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
            myStringProp: 'foobar',
            myIntegerProp: 8,
            myBooleanProp: true,
            myFloatProp: 88.92
          }
        }
      }
    },
    dynamicHashtableDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        expectedDynamicValue: {
          type: 'hashtable'
        },
        hashtableProp: {
          type: 'hashtable',
          mustEqual: getExpectedDynamicValue
        }
      }
    },
    nullExpectedValueDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        stringProp: {
          type: 'string',
          mustEqual: null
        }
      }
    }
  };
}
