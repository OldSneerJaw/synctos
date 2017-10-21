{
  objectNestedInArrayDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      elementList: {
        type: 'array',
        arrayElementsValidator: {
          type: 'object',
          propertyValidators: {
            id: {
              type: 'string',
              immutable: true
            },
            content: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  objectNestedInHashtableDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      hash: {
        type: 'hashtable',
        hashtableValuesValidator: {
          type: 'object',
          propertyValidators: {
            id: {
              type: 'string',
              immutable: true
            },
            content: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  objectNestedInObjectDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      object: {
        type: 'object',
        propertyValidators: {
          value: {
            type: 'object',
            propertyValidators: {
              id: {
                type: 'string',
                immutable: true
              },
              content: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  hashtableNestedInArrayDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      elementList: {
        type: 'array',
        arrayElementsValidator: {
          type: 'hashtable',
          hashtableValuesValidator: {
            type: 'integer',
            immutable: true
          }
        }
      }
    }
  },
  hashtableNestedInObjectDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      object: {
        type: 'object',
        propertyValidators: {
          hash: {
            type: 'hashtable',
            hashtableValuesValidator: {
              type: 'integer',
              immutable: true
            }
          }
        }
      }
    }
  },
  hashtableNestedInHashtableDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      hash: {
        type: 'hashtable',
        hashtableValuesValidator: {
          type: 'hashtable',
          hashtableValuesValidator: {
            type: 'integer',
            immutable: true
          }
        }
      }
    }
  }
}
