function() {
  function docTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  function isImmutable(doc, oldDoc) {
    return oldDoc ? oldDoc.applyImmutability : doc.applyImmutability;
  }

  var docChannels = { write: 'write' };

  return {
    staticImmutableDoc: {
      typeFilter: docTypeFilter,
      channels: docChannels,
      propertyValidators: {
        stringProp: {
          type: 'string'
        }
      },
      immutable: true,
      allowAttachments: true
    },
    dynamicImmutableDoc: {
      typeFilter: docTypeFilter,
      channels: docChannels,
      propertyValidators: {
        integerProp: {
          type: 'integer'
        },
        applyImmutability: {
          type: 'boolean'
        }
      },
      immutable: isImmutable
    },
    staticCannotReplaceDoc: {
      typeFilter: docTypeFilter,
      channels: docChannels,
      propertyValidators: {
        stringProp: {
          type: 'string'
        }
      },
      cannotReplace: true,
      allowAttachments: true
    },
    dynamicCannotReplaceDoc: {
      typeFilter: docTypeFilter,
      channels: docChannels,
      propertyValidators: {
        integerProp: {
          type: 'integer'
        },
        applyImmutability: {
          type: 'boolean'
        }
      },
      cannotReplace: isImmutable
    },
    staticCannotDeleteDoc: {
      typeFilter: docTypeFilter,
      channels: docChannels,
      propertyValidators: {
        stringProp: {
          type: 'string'
        }
      },
      cannotDelete: true,
      allowAttachments: true
    },
    dynamicCannotDeleteDoc: {
      typeFilter: docTypeFilter,
      channels: docChannels,
      propertyValidators: {
        integerProp: {
          type: 'integer'
        },
        applyImmutability: {
          type: 'boolean'
        }
      },
      cannotDelete: isImmutable
    }
  };
}
