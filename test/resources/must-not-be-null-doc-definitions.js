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
      // validate-document-definitions script since they include "mustNotBeNull" which has been deprecated
      propertyValidators: function() {
        return {
          stringProp: {
            type: 'string',
            mustNotBeNull: true
          },
          integerProp: {
            type: 'integer',
            mustNotBeNull: true
          },
          floatProp: {
            type: 'float',
            mustNotBeNull: true
          },
          booleanProp: {
            type: 'boolean',
            mustNotBeNull: true
          },
          datetimeProp: {
            type: 'datetime',
            mustNotBeNull: true
          },
          dateProp: {
            type: 'date',
            mustNotBeNull: true
          },
          enumProp: {
            type: 'enum',
            mustNotBeNull: true,
            predefinedValues: [ 0, 1, 2 ]
          },
          attachmentReferenceProp: {
            type: 'attachmentReference',
            mustNotBeNull: true
          },
          arrayProp: {
            type: 'array',
            mustNotBeNull: true,
            arrayElementsValidator: {
              type: 'string',
              mustNotBeNull: true
            }
          },
          objectProp: {
            type: 'object',
            mustNotBeNull: true,
            propertyValidators: {
              subProp: {
                type: 'integer',
                mustNotBeNull: true
              }
            }
          },
          hashtableProp: {
            type: 'hashtable',
            mustNotBeNull: true,
            hashtableValuesValidator: {
              type: 'float',
              mustNotBeNull: true
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
            mustNotBeNull: isRequired
          },
          integerProp: {
            type: 'integer',
            mustNotBeNull: isRequired
          },
          floatProp: {
            type: 'float',
            mustNotBeNull: isRequired
          },
          booleanProp: {
            type: 'boolean',
            mustNotBeNull: isRequired
          },
          datetimeProp: {
            type: 'datetime',
            mustNotBeNull: isRequired
          },
          dateProp: {
            type: 'date',
            mustNotBeNull: isRequired
          },
          enumProp: {
            type: 'enum',
            mustNotBeNull: isRequired,
            predefinedValues: [ 0, 1, 2 ]
          },
          attachmentReferenceProp: {
            type: 'attachmentReference',
            mustNotBeNull: isRequired
          },
          arrayProp: {
            type: 'array',
            mustNotBeNull: isRequired,
            arrayElementsValidator: {
              type: 'string',
              mustNotBeNull: isRequired
            }
          },
          objectProp: {
            type: 'object',
            mustNotBeNull: isRequired,
            propertyValidators: {
              subProp: {
                type: 'integer',
                mustNotBeNull: isRequired
              }
            }
          },
          hashtableProp: {
            type: 'hashtable',
            mustNotBeNull: isRequired,
            hashtableValuesValidator: {
              type: 'float',
              mustNotBeNull: isRequired
            }
          }
        };
      }
    }
  };
}
