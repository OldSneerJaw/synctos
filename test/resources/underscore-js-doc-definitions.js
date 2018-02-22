{
  underscoreDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      myProp: {
        type: 'string',
        required: true,
        customValidation: function(doc, oldDoc, currentItemEntry, validationItemStack) {
          var escapedItemValue = _.chain(currentItemEntry.itemValue).escape().value();
          if (escapedItemValue === currentItemEntry.itemValue) {
            return null;
          } else {
            return [ 'escaped value of "myProp" does not match raw value' ];
          }
        }
      }
    }
  }
}
