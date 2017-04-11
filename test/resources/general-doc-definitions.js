function() {
  function dynamicType(doc, oldDoc, value, oldValue) {
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
          minimumValue: function(doc, oldDoc, value, oldValue) {
            return doc.expectedDynamicMinimumValue;
          },
          minimumValueExclusive: function(doc, oldDoc, value, oldValue) {
            return doc.expectedDynamicMinimumExclusiveValue;
          },
          maximumValue: function(doc, oldDoc, value, oldValue) {
            return doc.expectedDynamicMaximumValue;
          },
          maximumValueExclusive: function(doc, oldDoc, value, oldValue) {
            return doc.expectedDynamicMaximumExclusiveValue;
          }
        }
      }
    }
  };
}
