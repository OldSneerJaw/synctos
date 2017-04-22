{
  initDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      testProp: {
        type: 'float',
        required: true
      }
    }
  }
}
