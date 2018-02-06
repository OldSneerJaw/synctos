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
        minimumValueExclusive: '-1131',
        maximumValueExclusive: '+12:31'
      }
    }
  }
}
