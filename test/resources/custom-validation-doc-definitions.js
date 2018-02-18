function() {
  return {
    customValidationDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        baseProp: {
          type: 'object',
          propertyValidators: {
            failValidation: {
              type: 'boolean'
            },
            customValidationProp: {
              type: 'string',
              customValidation: function(doc, oldDoc, currentItemElement, validationItemStack) {
                if (doc.baseProp.failValidation) {
                  return [
                    'doc: ' + jsonStringify(doc),
                    'oldDoc: ' + jsonStringify(oldDoc),
                    'currentItemElement: ' + jsonStringify(currentItemElement),
                    'validationItemStack: ' + jsonStringify(validationItemStack)
                  ];
                } else {
                  return [ ];
                }
              }
            }
          }
        }
      }
    }
  };
}
