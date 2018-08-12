function() {
  return {
    conditionalValidationDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        staticParentObjectProp: {
          type: 'object',
          propertyValidators: {
            conditionalValidationProp: {
              type: 'conditional',
              immutableWhenSet: true,
              skipValidationWhenValueUnchanged: true,
              validationCandidates: [
                {
                  condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                    var useOldValue = oldDoc && !isValueNullOrUndefined(currentItemEntry.oldItemValue);
                    var itemValue = useOldValue ? currentItemEntry.oldItemValue : currentItemEntry.itemValue;

                    return typeof(itemValue) === 'string';
                  },
                  validator: {
                    type: 'datetime',
                    minimumValue: '2018-08-10T24:00:00.000Z'
                  }
                },
                {
                  condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                    var useOldValue = oldDoc && !isValueNullOrUndefined(currentItemEntry.oldItemValue);
                    var itemValue = useOldValue ? currentItemEntry.oldItemValue : currentItemEntry.itemValue;

                    return typeof(itemValue) === 'number';
                  },
                  validator: {
                    type: 'integer',
                    minimumValue: 1533945600000, // Equivalent to 2018-08-10T24:00:00.000Z
                    immutableWhenSet: false // Overrides immutableWhenSet from the outer validator
                  }
                }
              ]
            }
          }
        },
        dynamicConfig: {
          type: 'object',
          propertyValidators: {
            excludeArrayValidator: {
              type: 'boolean'
            },
            excludeObjectValidator: {
              type: 'boolean'
            },
            excludeHashtableValidator: {
              type: 'boolean'
            },
            dynamicConditionType: {
              type: 'string'
            }
          }
        },
        dynamicConditionalValidationProp: {
          type: 'conditional',
          validationCandidates: function(doc, oldDoc, value, oldValue) {
            var candidates = [ ];

            var config = doc.dynamicConfig || { };

            if (!config.excludeArrayValidator) {
              candidates.push({
                condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                  return Array.isArray(currentItemEntry.itemValue);
                },
                validator: {
                  type: 'array',
                  mustNotBeEmpty: true,
                  arrayElementsValidator: {
                    type: 'float'
                  }
                }
              });
            }
            if (!config.excludeObjectValidator) {
              candidates.push({
                condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                  return typeof currentItemEntry.itemValue === 'object' && !Array.isArray(currentItemEntry.itemValue);
                },
                validator: {
                  type: 'object',
                  propertyValidators: {
                    stringProp: {
                      type: 'string',
                      required: true
                    }
                  }
                }
              });
            }
            if (!config.excludeHashtableValidator) {
              candidates.push({
                condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                  return typeof currentItemEntry.itemValue === 'object' && !Array.isArray(currentItemEntry.itemValue);
                },
                validator: {
                  type: 'hashtable',
                  hashtableValuesValidator: {
                    type: 'uuid'
                  }
                }
              });
            }
            if (config.dynamicConditionType) {
              candidates.push({
                condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                  var type = validationItemStack[0].itemValue.dynamicConfig.dynamicConditionType;

                  return typeof(currentItemEntry.itemValue) === type;
                },
                validator: {
                  type: config.dynamicConditionType
                }
              });
            }

            return candidates;
          }
        }
      }
    }
  };
}
