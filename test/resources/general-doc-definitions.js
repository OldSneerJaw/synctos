function() {
  function dynamicType(value, oldValue, doc, oldDoc) {
    return doc.expectedDynamicType;
  }

  return {
    generalDoc: {
      channels: {
        view: 'view',
        add: 'add',
        replace: [ 'replace', 'update' ],
        remove: [ 'remove', 'delete' ]
      },
      typeFilter: function(doc) {
        return doc._id === 'generalDoc';
      },
      propertyValidators: {
        arrayProp: {
          type: 'array'
        },
        attachmentReferenceProp: {
          type: 'attachmentReference'
        },
        booleanProp: {
          type: 'boolean'
        },
        dateProp: {
          type: 'date'
        },
        datetimeProp: {
          type: 'datetime'
        },
        floatProp: {
          type: 'float'
        },
        hashtableProp: {
          type: 'hashtable'
        },
        integerProp: {
          type: 'integer'
        },
        objectProp: {
          type: 'object',
          propertyValidators: {
            foo: {
              type: 'string'
            }
          }
        },
        stringProp: {
          type: 'string'
        },
        expectedDynamicType: {
          type: 'string'
        },
        expectedDynamicMinimumValue: {
          type: dynamicType
        },
        expectedDynamicMinimumExclusiveValue: {
          type: dynamicType
        },
        expectedDynamicMaximumValue: {
          type: dynamicType
        },
        expectedDynamicMaximumExclusiveValue: {
          type: dynamicType
        },
        dynamicTypeProp: {
          type: dynamicType,
          minimumValue: function(value, oldValue, doc, oldDoc) {
            return doc.expectedDynamicMinimumValue;
          },
          minimumValueExclusive: function(value, oldValue, doc, oldDoc) {
            return doc.expectedDynamicMinimumExclusiveValue;
          },
          maximumValue: function(value, oldValue, doc, oldDoc) {
            return doc.expectedDynamicMaximumValue;
          },
          maximumValueExclusive: function(value, oldValue, doc, oldDoc) {
            return doc.expectedDynamicMaximumExclusiveValue;
          }
        }
      }
    }
  };
}
