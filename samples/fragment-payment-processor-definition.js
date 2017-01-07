{
  channels: toDefaultSyncChannels(doc, oldDoc, 'CUSTOMER_PAYMENT_PROCESSORS'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    return createBusinessEntityRegex('paymentProcessor\\.[A-Za-z0-9_-]+$').test(doc._id);
  },
  propertyValidators: {
    provider: {
      // The payment processor type (e.g. "bluepay", "stripe")
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    },
    spreedlyGatewayToken: {
      // The unique token assigned to the payment processor when it was registered with Spreedly
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    },
    accountId: {
      // The ID of the Books account in which to record payments
      type: 'integer',
      required: true,
      minimumValue: 1
    },
    displayName: {
      // A friendly display name for the payment processor
      type: 'string'
    },
    supportedCurrencyCodes: {
      // A list of currency codes that are supported by the payment processor. If this property is null or undefined, it means that all
      // currencies are supported by the payment processor.
      type: 'array',
      arrayElementsValidator: {
        type: 'string',
        required: true,
        regexPattern: iso4217CurrencyCodeRegex
      }
    }
  }
}
