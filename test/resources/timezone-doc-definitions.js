{
  timezoneDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      formatValidationProp: {
        type: 'timezone'
      }
    }
  }
}
