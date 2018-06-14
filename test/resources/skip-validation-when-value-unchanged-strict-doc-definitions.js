function() {
  return {
    staticSkipValidationWhenValueUnchangedStrictDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        integerProp: {
          type: 'integer',
          skipValidationWhenValueUnchangedStrict: true,
          minimumValue: 0
        },
        floatProp: {
          type: 'float',
          skipValidationWhenValueUnchangedStrict: true,
          maximumValue: 0
        },
        stringProp: {
          type: 'string',
          skipValidationWhenValueUnchangedStrict: true,
          minimumLength: 4
        },
        booleanProp: {
          type: 'boolean',
          skipValidationWhenValueUnchangedStrict: true,
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
          skipValidationWhenValueUnchangedStrict: true,
          maximumValue: '1953-01-14'
        },
        datetimeProp: {
          type: 'datetime',
          skipValidationWhenValueUnchangedStrict: true,
          minimumValue: '2018-06-13T23:33+00:00',
          maximumValue: '2018-06-13T23:33Z'
        },
        timeProp: {
          type: 'time',
          skipValidationWhenValueUnchangedStrict: true,
          minimumValueExclusive: '17:45:53.911'
        },
        timezoneProp: {
          type: 'timezone',
          skipValidationWhenValueUnchangedStrict: true,
          maximumValueExclusive: '+15:30'
        },
        enumProp: {
          type: 'enum',
          predefinedValues: [ 1, 2, 3 ],
          skipValidationWhenValueUnchangedStrict: true
        },
        uuidProp: {
          type: 'uuid',
          skipValidationWhenValueUnchangedStrict: true,
          maximumValueExclusive: '10000000-0000-0000-0000-000000000000'
        },
        attachmentReferenceProp: {
          type: 'attachmentReference',
          skipValidationWhenValueUnchangedStrict: true,
          regexPattern: /^[a-z]+\.txt$/
        },
        arrayProp: {
          type: 'array',
          skipValidationWhenValueUnchangedStrict: true,
          maximumLength: 3
        },
        objectProp: {
          type: 'object',
          skipValidationWhenValueUnchangedStrict: true,
          propertyValidators: {
            nestedProp: {
              type: 'string'
            }
          }
        },
        hashtableProp: {
          type: 'hashtable',
          skipValidationWhenValueUnchangedStrict: true,
          hashtableValuesValidator: {
            type: 'integer'
          }
        }
      }
    },
    dynamicSkipValidationWhenValueUnchangedStrictDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        allowValidationSkip: {
          type: 'boolean'
        },
        minimumUuidValue: {
          type: 'uuid'
        },
        uuidProp: {
          type: 'uuid',
          skipValidationWhenValueUnchangedStrict: function(doc, oldDoc, value, oldValue) {
            return !isDocumentMissingOrDeleted(oldDoc) ? oldDoc.allowValidationSkip : doc.allowValidationSkip;
          },
          minimumValue: function(doc, oldDoc, value, oldValue) {
            return doc.minimumUuidValue;
          }
        }
      }
    }
  };
}
