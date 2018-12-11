function() {
  function sharedTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  function isRequired(doc, oldDoc, value, oldValue) {
    return oldDoc ? oldDoc.dynamicPropsRequired : doc.dynamicPropsRequired;
  }

  return {
    staticDoc: {
      typeFilter: sharedTypeFilter,
      channels: { write: 'write' },
      // Use a function to define the property validators so that the document is not rejected by the
      // validate-document-definitions script since they include "mustNotBeMissing" which has been deprecated
      propertyValidators: function() {
        return {
          stringProp: {
            type: 'string',
            mustNotBeMissing: true
          },
          integerProp: {
            type: 'integer',
            mustNotBeMissing: true
          },
          floatProp: {
            type: 'float',
            mustNotBeMissing: true
          },
          booleanProp: {
            type: 'boolean',
            mustNotBeMissing: true
          },
          datetimeProp: {
            type: 'datetime',
            mustNotBeMissing: true
          },
          dateProp: {
            type: 'date',
            mustNotBeMissing: true
          },
          enumProp: {
            type: 'enum',
            mustNotBeMissing: true,
            predefinedValues: [ 0, 1, 2 ]
          },
          attachmentReferenceProp: {
            type: 'attachmentReference',
            mustNotBeMissing: true
          },
          arrayProp: {
            type: 'array',
            mustNotBeMissing: true,
            arrayElementsValidator: {
              type: 'string',
              mustNotBeMissing: true
            }
          },
          objectProp: {
            type: 'object',
            mustNotBeMissing: true,
            propertyValidators: {
              subProp: {
                type: 'integer',
                mustNotBeMissing: true
              }
            }
          },
          hashtableProp: {
            type: 'hashtable',
            mustNotBeMissing: true,
            hashtableValuesValidator: {
              type: 'float',
              mustNotBeMissing: true
            }
          }
        };
      }
    },
    dynamicDoc: {
      typeFilter: sharedTypeFilter,
      channels: { write: 'write' },
      propertyValidators: function() {
        return {
          dynamicPropsRequired: {
            type: 'boolean'
          },
          stringProp: {
            type: 'string',
            mustNotBeMissing: isRequired
          },
          integerProp: {
            type: 'integer',
            mustNotBeMissing: isRequired
          },
          floatProp: {
            type: 'float',
            mustNotBeMissing: isRequired
          },
          booleanProp: {
            type: 'boolean',
            mustNotBeMissing: isRequired
          },
          datetimeProp: {
            type: 'datetime',
            mustNotBeMissing: isRequired
          },
          dateProp: {
            type: 'date',
            mustNotBeMissing: isRequired
          },
          enumProp: {
            type: 'enum',
            mustNotBeMissing: isRequired,
            predefinedValues: [ 0, 1, 2 ]
          },
          attachmentReferenceProp: {
            type: 'attachmentReference',
            mustNotBeMissing: isRequired
          },
          arrayProp: {
            type: 'array',
            mustNotBeMissing: isRequired,
            arrayElementsValidator: {
              type: 'string',
              mustNotBeMissing: isRequired
            }
          },
          objectProp: {
            type: 'object',
            mustNotBeMissing: isRequired,
            propertyValidators: {
              subProp: {
                type: 'integer',
                mustNotBeMissing: isRequired
              }
            }
          },
          hashtableProp: {
            type: 'hashtable',
            mustNotBeMissing: isRequired,
            hashtableValuesValidator: {
              type: 'float',
              mustNotBeMissing: isRequired
            }
          }
        };
      }
    }
  };
}
