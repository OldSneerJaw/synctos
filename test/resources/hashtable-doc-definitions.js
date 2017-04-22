function() {
  function isNonEmpty(doc, oldDoc, value, oldValue) {
    return oldDoc ? oldDoc.dynamicKeysMustNotBeEmpty : doc.dynamicKeysMustNotBeEmpty;
  }

  function dynamicRegexPattern(doc, oldDoc, value, oldValue) {
    return oldDoc ? new RegExp(oldDoc.dynamicKeyRegex) : new RegExp(doc.dynamicKeyRegex);
  }

  return {
    hashtableDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'hashtableDoc';
      },
      propertyValidators: {
        sizeValidationProp: {
          type: 'hashtable',
          minimumSize: 2,
          maximumSize: 2
        },
        staticNonEmptyKeyProp: {
          type: 'hashtable',
          hashtableKeysValidator: {
            mustNotBeEmpty: true
          }
        },
        dynamicKeysMustNotBeEmpty: {
          type: 'boolean',
          immutable: true
        },
        dynamicNonEmptyKeyProp: {
          type: 'hashtable',
          hashtableKeysValidator: {
            mustNotBeEmpty: isNonEmpty
          }
        },
        staticKeyRegexPatternValidationProp: {
          type: 'hashtable',
          hashtableKeysValidator: {
            regexPattern: /^[a-zA-Z]+$/
          }
        },
        dynamicKeyRegex: {
          type: 'string',
          immutable: true
        },
        dynamicKeyRegexPatternValidationProp: {
          type: 'hashtable',
          hashtableKeysValidator: {
            regexPattern: dynamicRegexPattern
          }
        }
      }
    }
  };
}
