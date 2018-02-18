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
              customValidation: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                var parentItemValue = validationItemStack[validationItemStack.length - 1].itemValue;
                if (parentItemValue && parentItemValue.failValidation) {
                  return [
                    'doc: ' + jsonStringify(doc),
                    'oldDoc: ' + jsonStringify(oldDoc),
                    'currentItemEntry: ' + jsonStringify(currentItemEntry),
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
