{
  underscoreDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    propertyValidators: {
      myProp: {
        type: 'string',
        required: true,
        customValidation: function(doc, oldDoc, currentItemElement, validationItemStack) {
          var escapedItemValue = _.chain(currentItemElement.itemValue).escape().value();

          if (escapedItemValue === currentItemElement.itemValue) {
            return null;
          } else {
            return [ 'escaped value of "myProp" does not match raw value' ];
          }
        }
      }
    }
  }
}
