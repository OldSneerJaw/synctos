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
          mustEqualStrict: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
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
          mustEqualStrict: getExpectedDynamicValue
        }
      }
    },
    staticObjectDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        objectProp: {
          type: 'object',
          mustEqualStrict: {
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
          mustEqualStrict: getExpectedDynamicValue
        }
      }
    },
    staticHashtableDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        hashtableProp: {
          type: 'hashtable',
          mustEqualStrict: {
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
          mustEqualStrict: getExpectedDynamicValue
        }
      }
    },
    arrayElementConstraintDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        arrayProp: {
          type: 'array',
          arrayElementsValidator: {
            type: 'string',
            mustEqualStrict: 'foobar'
          }
        }
      }
    },
    hashtableElementConstraintDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        hashtableProp: {
          type: 'hashtable',
          hashtableValuesValidator: {
            type: 'integer',
            mustEqualStrict: -15
          }
        }
      }
    },
    specializedStringsDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        dateProp: {
          type: 'date',
          mustEqualStrict: '2018-02-01'
        },
        datetimeProp: {
          type: 'datetime',
          mustEqualStrict: '2018-02-12T11:10:00.000-08:00'
        },
        timeProp: {
          type: 'time',
          mustEqualStrict: '11:11:52.000'
        },
        timezoneProp: {
          type: 'timezone',
          mustEqualStrict: '+00:00'
        },
        uuidProp: {
          type: 'uuid',
          mustEqualStrict: '25f5f392-2c4d-4ab1-9056-52d227dd9a37'
        }
      }
    },
    nullExpectedValueDoc: {
      typeFilter: sharedTypeFilter,
      channels: docChannels,
      propertyValidators: {
        stringProp: {
          type: 'string',
          mustEqualStrict: null
        }
      }
    }
  };
}
