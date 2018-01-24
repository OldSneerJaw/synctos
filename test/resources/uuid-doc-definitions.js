{
  myDocType: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      uuidProp: {
        type: 'uuid'
      }
    }
  }
}
