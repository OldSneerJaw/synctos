{
  channels: function(doc, oldDoc) {
    var businessId = getBusinessId(doc, oldDoc);

    // Only service users can create, replace or delete payment attempts to prevent regular users from tampering
    return {
      view: toSyncChannel(businessId, 'VIEW_INVOICE_PAYMENT_REQUISITIONS'),
      write: 'payment-attempt-write'
    };
  },
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    return /^paymentAttempt\.[A-Za-z0-9_-]+$/.test(doc._id);
  },
  immutable: true,
  propertyValidators: {
    businessId: {
      // The ID of the business with which the payment attempt is associated
      type: 'integer',
      required: true,
      minimumValue: 1
    },
    invoiceRecordId: {
      // The ID of the invoice with which the payment attempt is associated
      type: 'integer',
      required: true,
      minimumValue: 1
    },
    paymentRequisitionId: {
      // The ID of the payment requisition
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    },
    paymentAttemptSpreedlyToken: {
      // The unique token that was assigned to the payment attempt by Spreedly
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    },
    date: {
      // When the payment was attempted
      type: 'datetime',
      required: true
    },
    internalPaymentRecordId: {
      // The ID of the payment record in Books' general ledger
      type: 'integer',
      minimumValue: 1
    },
    gatewayTransactionId: {
      // The ID of the payment attempt as specified by the payment processor
      type: 'string',
      mustNotBeEmpty: true
    },
    gatewayMessage: {
      // The message specified by the payment processor in response to the payment attempt
      type: 'string'
    },
    totalAmountPaid: {
      // The raw amount that was paid as an integer (e.g. 19999)
      type: 'integer',
      minimumValue: 1
    },
    totalAmountPaidFormatted: {
      // The formatted amount that was paid (e.g. $199.99)
      type: 'string',
      mustNotBeEmpty: true
    }
  }
}
