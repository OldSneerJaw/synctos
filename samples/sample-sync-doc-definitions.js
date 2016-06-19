function() {
  // The channel that is only applicable to Kashoo services
  var serviceChannel = 'SERVICE';

  // Matches values that look like three-letter ISO 4217 currency codes. It is not comprehensive.
  var iso4217CurrencyCodeRegex = new RegExp('^[A-Z]{3}$');

  // Creates a RegExp to match the ID of an entity that belongs to a business
  function createBusinessEntityRegex(suffixPattern) {
    // While business IDs have traditionally been numeric only, this
    return new RegExp('^biz\\.[A-Za-z0-9_-]+\\.' + suffixPattern + '$');
  }

  // Checks that a business ID is valid (an integer greater than 0) and is not changed from the old version of the document
  function validateBusinessIdProperty(doc, oldDoc, currentItemElement, validationItemStack) {
    var parentObjectElement = validationItemStack[validationItemStack.length - 1];

    var businessId = currentItemElement.itemValue;
    var oldBusinessId = currentItemElement.oldItemValue;

    var validationErrors = [ ];

    if (parentObjectElement.oldItemValue && oldBusinessId !== businessId) {
      validationErrors.push('cannot change "businessId" property');
    }

    return validationErrors;
  }

  // Retrieves the ID of the business to which the document belongs
  function getBusinessId(doc, oldDoc) {
    var regex = new RegExp('^biz\\.([A-Za-z0-9_-]+)(?:\\..+)?$');
    var matchGroups = regex.exec(doc._id);
    if (matchGroups) {
      return matchGroups[1];
    } else if (oldDoc && oldDoc.businessId) {
      // The document ID doesn't contain a business ID, so use the property from the old document
      return oldDoc.businessId || null;
    } else {
      // Neither the document ID nor the old document's contents contain a business ID, so use the property from the new document
      return doc.businessId || null;
    }
  }

  // Converts a Books business privilege to a Couchbase Sync Gateway document channel name
  function toSyncChannel(businessId, privilege) {
    return businessId + '-' + privilege;
  }

  // Builds a function that returns the view, add, replace, remove channels extrapolated from the specified base privilege, name which is
  // formatted according to the de facto Books convention of "VIEW_FOOBAR", "ADD_FOOBAR", "CHANGE_FOOBAR" and "REMOVE_FOOBAR" assuming the
  // base privilege name is "FOOBAR"
  function toDefaultSyncChannels(doc, oldDoc, basePrivilegeName) {
    var businessId = getBusinessId(doc, oldDoc);

    return function(doc, oldDoc) {
      return {
        view: [ toSyncChannel(businessId, 'VIEW_' + basePrivilegeName), serviceChannel ],
        add: [ toSyncChannel(businessId, 'ADD_' + basePrivilegeName), serviceChannel ],
        replace: [ toSyncChannel(businessId, 'CHANGE_' + basePrivilegeName), serviceChannel ],
        remove: [ toSyncChannel(businessId, 'REMOVE_' + basePrivilegeName), serviceChannel ]
      }
    };
  }

  // The document type definitions. For everyone's sanity, please keep these in case-insensitive alphabetical order
  return {
    business: {
      channels: function(doc, oldDoc) {
        var businessId = getBusinessId(doc, oldDoc);

        return {
          view: [ toSyncChannel(businessId, 'VIEW'), serviceChannel ],
          add: [ toSyncChannel(businessId, 'CHANGE_BUSINESS'), serviceChannel ],
          replace: [ toSyncChannel(businessId, 'CHANGE_BUSINESS'), serviceChannel ],
          remove: [ toSyncChannel(businessId, 'REMOVE_BUSINESS'), serviceChannel ]
        };
      },
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^biz\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      allowAttachments: true,
      propertyValidators: [
        {
          propertyName: 'businessLogoAttachment',
          type: 'attachmentReference',
          required: false,
          maximumSize: 2097152,
          supportedExtensions: [ 'png', 'gif', 'jpg', 'jpeg' ],
          supportedContentTypes: [ 'image/png', 'image/gif', 'image/jpeg' ]
        },
        {
          propertyName: 'defaultInvoiceTemplate',
          type: 'object',
          required: false,
          propertyValidators: [
            {
              propertyName: 'templateId',
              type: 'string',
              required: false,
              mustNotBeEmpty: true
            }
          ],
        },
        {
          propertyName: 'paymentProcessors',
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        }
      ]
    },

    notification: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'sender',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'type',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'subject',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'message',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'createdAt',
          type: 'datetime',
          required: true,
          immutable: true
        },
        {
          propertyName: 'firstReadAt',
          type: 'datetime'
        },
        {
          propertyName: 'actions',
          type: 'array',
          arrayElementsValidator: {
            type: 'object',
            propertyValidators: [
              {
                propertyName: 'url',
                type: 'string',
                required: true,
                mustNotBeEmpty: true
              },
              {
                propertyName: 'label',
                type: 'string',
                required: true,
                mustNotBeEmpty: true
              }
            ]
          }
        }
      ]
    },

    notificationsConfig: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notificationsConfig$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'notificationTypes',
          type: 'hashtable',
          hashtableKeysValidator: {
            type: 'string',
            mustNotBeEmpty: true,
            regexPattern: new RegExp('^[a-z_-]+$')
          },
          hashtableValuesValidator: {
            type: 'object',
            required: true,
            propertyValidators: [
              {
                propertyName: 'enabledTransports',
                type: 'array',
                arrayElementsValidator: {
                  type: 'string',
                  mustNotBeEmpty: true
                }
              },
              {
                propertyName: 'disabledTransports',
                type: 'array',
                arrayElementsValidator: {
                  type: 'string',
                  mustNotBeEmpty: true
                }
              }
            ]
          }
        }
      ]
    },

    notificationsReference: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notifications$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'allNotificationIds',
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        },
        {
          propertyName: 'unreadNotificationIds',
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        }
      ]
    },

    notificationTransport: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notificationTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'type',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'recipient',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        }
      ]
    },

    notificationTransportProcessingSummary: {
      channels: {
        view: serviceChannel,
        add: serviceChannel,
        replace: serviceChannel,
        remove: serviceChannel
      },
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+\\.processedTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'processedBy',
          type: 'string',
          immutable: true
        },
        {
          propertyName: 'processedAt',
          type: 'datetime',
          required: true,
          immutable: true
        },
        {
          propertyName: 'sentAt',
          type: 'datetime'
        }
      ]
    },

    paymentAttempt: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^paymentAttempt\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'businessId',
          type: 'integer',
          minimumValue: 1,
          customValidation: validateBusinessIdProperty
        },
        {
          propertyName: 'invoiceRecordId',
          type: 'integer',
          required: true,
          minimumValue: 1
        },
        {
          propertyName: 'paymentRequisitionId',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'paymentAttemptSpreedlyToken',
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
        },
        {
          propertyName: 'date',
          type: 'date',
          required: true
        },
        {
          propertyName: 'internalPaymentRecordId',
          type: 'integer',
          minimumValue: 1
        },
        {
          propertyName: 'gatewayTransactionId',
          type: 'string',
          mustNotBeEmpty: true
        },
        {
          propertyName: 'gatewayMessage',
          type: 'string'
        },
        {
          propertyName: 'totalAmountPaid',
          type: 'integer',
          minimumValue: 1
        },
        {
          propertyName: 'totalAmountPaidFormatted',
          type: 'string',
          mustNotBeEmpty: true
        }
      ]
    },

    paymentProcessorDefinition: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'CUSTOMER_PAYMENT_PROCESSORS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('paymentProcessor\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'provider',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'spreedlyGatewayToken',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'accountId',
          type: 'integer',
          required: true,
          minimumValue: 1
        },
        {
          propertyName: 'displayName',
          type: 'string'
        },
        {
          propertyName: 'supportedCurrencyCodes',
          type: 'array',
          arrayElementsValidator: {
            type: 'string',
            regexPattern: iso4217CurrencyCodeRegex
          }
        }
      ]
    },

    paymentRequisition: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^paymentRequisition\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'invoiceRecordId',
          type: 'integer',
          required: true,
          minimumValue: 1
        },
        {
          propertyName: 'businessId',
          type: 'integer',
          minimumValue: 1,
          customValidation: validateBusinessIdProperty
        },
        {
          propertyName: 'issuedAt',
          type: 'datetime'
        },
        {
          propertyName: 'issuedByUserId',
          type: 'integer',
          minimumValue: 1
        },
        {
          propertyName: 'invoiceRecipients',
          type: 'string'
        }
      ]
    },

    paymentRequisitionsReference: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('invoice\\.[A-Za-z0-9_-]+.paymentRequisitions$').test(doc._id);
      },
      propertyValidators: [
        {
          propertyName: 'paymentProcessorId',
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        {
          propertyName: 'paymentRequisitionIds',
          type: 'array',
          required: true,
          mustNotBeEmpty: true,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        },
        {
          propertyName: 'paymentAttemptIds',
          type: 'array',
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        }
      ]
    }
  };
}
