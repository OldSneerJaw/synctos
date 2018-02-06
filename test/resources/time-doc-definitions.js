{
  timeDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      formatValidationProp: {
        type: 'time'
      },
      minAndMaxInclusiveValuesProp: {
        type: 'time',
        minimumValue: '01:08:00.000',
        maximumValue: '01:09:01'
      },
      minAndMaxExclusiveValuesProp: {
        type: 'time',
        minimumValueExclusive: '13:42',
        maximumValueExclusive: '13:42:00.002'
      }
    }
  }
}
