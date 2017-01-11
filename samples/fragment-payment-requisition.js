{
  channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    return new RegExp('^paymentRequisition\\.[A-Za-z0-9_-]+$').test(doc._id);
  },
  cannotReplace: true,
  propertyValidators: {
    businessId: {
      // The ID of the business with which the payment requisition is associated
      type: 'integer',
      minimumValue: 1,
      customValidation: validateBusinessIdProperty
    },
    invoiceRecordId: {
      // The ID of the invoice with which the payment requisition is associated
      type: 'integer',
      required: true,
      minimumValue: 1
    },
    issuedAt: {
      // When the payment requisition was sent/issued
      type: 'datetime'
    },
    issuedByUserId: {
      // The ID of the Kashoo user that issued the payment requisition
      type: 'integer',
      minimumValue: 1
    },
    invoiceRecipients: {
      // Who received the payment requisition
      type: 'string'
    }
  }
}
