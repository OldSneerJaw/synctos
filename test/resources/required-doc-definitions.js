function() {
  function customTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  function isRequired(doc, oldDoc, value, oldValue) {
    return oldDoc ? oldDoc.dynamicPropsRequired : doc.dynamicPropsRequired;
  }

  return {
    staticDoc: {
      typeFilter: customTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        stringProp: {
          type: 'string',
          required: true
        },
        integerProp: {
          type: 'integer',
          required: true
        },
        floatProp: {
          type: 'float',
          required: true
        },
        booleanProp: {
          type: 'boolean',
          required: true
        },
        datetimeProp: {
          type: 'datetime',
          required: true
        },
        dateProp: {
          type: 'date',
          required: true
        },
        enumProp: {
          type: 'enum',
          required: true,
          predefinedValues: [ 0, 1, 2 ]
        },
        attachmentReferenceProp: {
          type: 'attachmentReference',
          required: true
        },
        arrayProp: {
          type: 'array',
          required: true,
          arrayElementsValidator: {
            type: 'string',
            required: true
          }
        },
        objectProp: {
          type: 'object',
          required: true,
          propertyValidators: {
            subProp: {
              type: 'integer',
              required: true
            }
          }
        },
        hashtableProp: {
          type: 'hashtable',
          required: true,
          hashtableValuesValidator: {
            type: 'float',
            required: true
          }
        }
      }
    },
    dynamicDoc: {
      typeFilter: customTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        dynamicPropsRequired: {
          type: 'boolean'
        },
        stringProp: {
          type: 'string',
          required: isRequired
        },
        integerProp: {
          type: 'integer',
          required: isRequired
        },
        floatProp: {
          type: 'float',
          required: isRequired
        },
        booleanProp: {
          type: 'boolean',
          required: isRequired
        },
        datetimeProp: {
          type: 'datetime',
          required: isRequired
        },
        dateProp: {
          type: 'date',
          required: isRequired
        },
        enumProp: {
          type: 'enum',
          required: isRequired,
          predefinedValues: [ 0, 1, 2 ]
        },
        attachmentReferenceProp: {
          type: 'attachmentReference',
          required: isRequired
        },
        arrayProp: {
          type: 'array',
          required: isRequired,
          arrayElementsValidator: {
            type: 'string',
            required: isRequired
          }
        },
        objectProp: {
          type: 'object',
          required: isRequired,
          propertyValidators: {
            subProp: {
              type: 'integer',
              required: isRequired
            }
          }
        },
        hashtableProp: {
          type: 'hashtable',
          required: isRequired,
          hashtableValuesValidator: {
            type: 'float',
            required: isRequired
          }
        }
      }
    }
  };
}
