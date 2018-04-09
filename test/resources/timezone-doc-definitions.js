{
  timezoneDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      formatValidationProp: {
        type: 'timezone'
      },
      minAndMaxInclusiveValuesProp: {
        type: 'timezone',
        minimumValue: 'Z',
        maximumValue: '+00:00'
      },
      minAndMaxExclusiveValuesProp: {
        type: 'timezone',
        minimumValueExclusive: '-11:31',
        maximumValueExclusive: '+12:31'
      },
      immutableValidationProp: {
        type: 'timezone',
        immutable: true
      }
    }
  },
  timezoneMustEqualDocType: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      equalityValidationProp: {
        type: 'timezone',
        mustEqual: 'Z'
      }
    }
  }
}
