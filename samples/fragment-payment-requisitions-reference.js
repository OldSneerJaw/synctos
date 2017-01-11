{
  channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    return createBusinessEntityRegex('invoice\\.[A-Za-z0-9_-]+.paymentRequisitions$').test(doc._id);
  },
  propertyValidators: {
    paymentProcessorId: {
      // The ID of the payment processor to use
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    },
    paymentRequisitionIds: {
      // A list of payment requisitions that were issued for the invoice
      type: 'array',
      required: true,
      mustNotBeEmpty: true,
      arrayElementsValidator: {
        type: 'string',
        required: true,
        mustNotBeEmpty: true
      }
    },
    paymentAttemptIds: {
      // A list of payment attempts that were made for the invoice
      type: 'array',
      arrayElementsValidator: {
        type: 'string',
        required: true,
        mustNotBeEmpty: true
      }
    }
  }
}
