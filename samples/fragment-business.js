{
  channels: function(doc, oldDoc) {
    var businessId = getBusinessId(doc, oldDoc);

    // Because creating a business config document is not the same as creating a business, reuse the same permission for both creating
    // and updating
    return {
      view: toSyncChannel(businessId, 'VIEW'),
      add: toSyncChannel(businessId, 'CHANGE_BUSINESS'),
      replace: toSyncChannel(businessId, 'CHANGE_BUSINESS'),
      remove: toSyncChannel(businessId, 'REMOVE_BUSINESS')
    };
  },
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    return new RegExp('^biz\\.[A-Za-z0-9_-]+$').test(doc._id);
  },
  allowAttachments: true,
  propertyValidators: {
    businessLogoAttachment: {
      // The name of the Sync Gateway file attachment that is to be used as the business/invoice logo image
      type: 'attachmentReference',
      required: false,
      maximumSize: 2097152,
      supportedExtensions: [ 'png', 'gif', 'jpg', 'jpeg' ],
      supportedContentTypes: [ 'image/png', 'image/gif', 'image/jpeg' ]
    },
    defaultInvoiceTemplate: {
      // Configuration for the default template to use in invoice PDFs
      type: 'object',
      required: false,
      propertyValidators: {
        templateId: {
          type: 'string',
          required: false,
          mustNotBeEmpty: true
        }
      },
    },
    paymentProcessors: {
      // The list of payment processor IDs that are available for the business
      type: 'array',
      required: false,
      arrayElementsValidator: {
        type: 'string',
        required: true,
        mustNotBeEmpty: true
      }
    }
  }
}
