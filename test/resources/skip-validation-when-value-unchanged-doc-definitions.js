function() {
  return {
    staticSkipValidationWhenValueUnchangedDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        integerProp: {
          type: 'integer',
          skipValidationWhenValueUnchanged: true,
          minimumValue: 0
        },
        floatProp: {
          type: 'float',
          skipValidationWhenValueUnchanged: true,
          maximumValue: 0
        },
        stringProp: {
          type: 'string',
          skipValidationWhenValueUnchanged: true,
          minimumLength: 4
        },
        booleanProp: {
          type: 'boolean',
          skipValidationWhenValueUnchanged: true,
          customValidation: function(doc, oldDoc, currentItemEntry) {
            if (isValueNullOrUndefined(currentItemEntry.itemValue) || currentItemEntry.itemValue) {
              return [ ];
            } else {
              return [ currentItemEntry.itemName + ' must be true' ];
            }
          }
        },
        dateProp: {
          type: 'date',
          skipValidationWhenValueUnchanged: true,
          maximumValue: '1953-01-14'
        },
        datetimeProp: {
          type: 'datetime',
          skipValidationWhenValueUnchanged: true,
          minimumValue: '2018-06-13T23:33+00:00',
          maximumValue: '2018-06-13T23:33Z'
        },
        timeProp: {
          type: 'time',
          skipValidationWhenValueUnchanged: true,
          minimumValueExclusive: '17:45:53.911'
        },
        timezoneProp: {
          type: 'timezone',
          skipValidationWhenValueUnchanged: true,
          maximumValueExclusive: '+15:30'
        },
        enumProp: {
          type: 'enum',
          predefinedValues: [ 1, 2, 3 ],
          skipValidationWhenValueUnchanged: true
        },
        uuidProp: {
          type: 'uuid',
          skipValidationWhenValueUnchanged: true,
          maximumValueExclusive: '10000000-0000-0000-0000-000000000000'
        },
        attachmentReferenceProp: {
          type: 'attachmentReference',
          skipValidationWhenValueUnchanged: true,
          regexPattern: /^[a-z]+\.txt$/
        },
        arrayProp: {
          type: 'array',
          skipValidationWhenValueUnchanged: true,
          maximumLength: 3
        },
        objectProp: {
          type: 'object',
          skipValidationWhenValueUnchanged: true,
          propertyValidators: {
            nestedProp: {
              type: 'string'
            }
          }
        },
        hashtableProp: {
          type: 'hashtable',
          skipValidationWhenValueUnchanged: true,
          hashtableValuesValidator: {
            type: 'integer'
          }
        }
      }
    },
    dynamicSkipValidationWhenValueUnchangedDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        allowValidationSkip: {
          type: 'boolean'
        },
        myProp: {
          type: 'uuid',
          skipValidationWhenValueUnchanged: function(doc, oldDoc, value, oldValue) {
            return oldDoc ? oldDoc.allowValidationSkip : doc.allowValidationSkip;
          }
        }
      }
    }
  };
}
