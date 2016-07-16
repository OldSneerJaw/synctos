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
      };
    };
  }

  // The document type definitions. For everyone's sanity, please keep the document types in case-insensitive alphabetical order
  return {
    // The base business configuration. Should not be expanded with new properties unless they are directly related to the existing
    // properties so as to keep the document type from becoming even more of a dumping ground for general business configuration, which
    // makes it more difficult to resolve sync conflicts. Instead, create a new document type.
    business: {
      channels: function(doc, oldDoc) {
        var businessId = getBusinessId(doc, oldDoc);

        // Because creating a business config document is not the same as creating a business, reuse the same permission for both creating
        // and updating
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
    },

    // A notification to be delivered to the registered notification transports for the corresponding notification type
    notification: {
      channels: function(doc, oldDoc) {
        var businessId = getBusinessId(doc, oldDoc);

        // Only service users can create new notifications
        return {
          view: [ toSyncChannel(businessId, 'VIEW_NOTIFICATIONS'), serviceChannel ],
          add: serviceChannel,
          replace: [ toSyncChannel(businessId, 'CHANGE_NOTIFICATIONS'), serviceChannel ],
          remove: [ toSyncChannel(businessId, 'REMOVE_NOTIFICATIONS'), serviceChannel ]
        };
      },
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        sender: {
          // Which Kashoo app/service generated the notification
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        type: {
          // The type of notification. Corresponds to an entry in the business' notificationsConfig.notificationTypes property.
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        subject: {
          // The subject line of the notification
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        message: {
          // The message body of the notification
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        createdAt: {
          // When the notification was first created
          type: 'datetime',
          required: true,
          immutable: true
        },
        firstReadAt: {
          // When the notification was first read
          type: 'datetime',
          immutableIfSet: true
        },
        siteName: {
          // The name of the white label site/brand for which the notification was generated
          type: 'string',
          mustNotBeEmpty: true,
          immutable: true
        },
        actions: {
          // A list of actions that are available to the recipient of the notification
          type: 'array',
          immutable: true,
          arrayElementsValidator: {
            type: 'object',
            required: true,
            propertyValidators: {
              url: {
                // The URL of the action
                type: 'string',
                required: true,
                mustNotBeEmpty: true
              },
              label: {
                // A plain text label for the action
                type: 'string',
                required: true,
                mustNotBeEmpty: true
              }
            }
          }
        }
      }
    },

    // Configuration of notification transports for the business
    notificationsConfig: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notificationsConfig$').test(doc._id);
      },
      propertyValidators: {
        notificationTypes: {
          // A map of notification types -> enabled notification transports
          type: 'hashtable',
          hashtableKeysValidator: {
            type: 'string',
            mustNotBeEmpty: true,
            regexPattern: new RegExp('^[a-zA-Z]+$')
          },
          hashtableValuesValidator: {
            type: 'object',
            required: true,
            propertyValidators: {
              enabledTransports: {
                // The list of notification transports that are enabled for the notification type
                type: 'array',
                arrayElementsValidator: {
                  type: 'object',
                  required: true,
                  propertyValidators: {
                    transportId: {
                      // The ID of the notification transport
                      type: 'string',
                      required: true,
                      mustNotBeEmpty: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // Keeps track of all notifications that have been generated for a business
    notificationsReference: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notifications$').test(doc._id);
      },
      propertyValidators: {
        allNotificationIds: {
          // A list of the IDs of every notification that has ever been generated for the business
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            required: true,
            mustNotBeEmpty: true
          }
        },
        unreadNotificationIds: {
          // The IDs of notifications that have not yet been read
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            required: true,
            mustNotBeEmpty: true
          }
        }
      }
    },

    // Configuration for a notification transport
    notificationTransport: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notificationTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        type: {
          // The type of notification transport (e.g. email, sms). Used by a notification service to determine how to deliver a
          // notification.
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        recipient: {
          // The intended recipient for notifications that are configured to use this transport
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        }
      }
    },

    // A summary of the progress of processing and sending a notification via a specific notification transport method
    notificationTransportProcessingSummary: {
      channels: {
        write: serviceChannel
      },
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+\\.processedTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        nonce: {
          // A unique value that results in a unique document revision to prevent the notification's transport from being processed by
          // multiple instances of a notification service. If an instance encounters a conflict when saving this element, then it can be
          // assured that someone else is already processing it and instead move on to something else.
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        processedBy: {
          // The name/ID of the service that processed this notification for the corresponding transport
          type: 'string',
          immutable: true
        },
        processedAt: {
          // Used to indicate when the notification has been processed for transport (but not necessarily sent yet) by a
          // notification service
          type: 'datetime',
          required: true,
          immutable: true
        },
        sentAt: {
          // The date/time at which the notification was actually sent. Typically distinct from the date/time at which it was processed.
          type: 'datetime',
          immutableIfSet: true
        }
      }
    },

    // Describes an attempt to pay an invoice payment requisition, whether successful or not. May not be replaced or deleted once created.
    paymentAttempt: {
      channels: function(doc, oldDoc) {
        var businessId = getBusinessId(doc, oldDoc);

        // Only service users can create, replace or delete payment attempts to prevent regular users from tampering
        return {
          view: [ toSyncChannel(businessId, 'VIEW_INVOICE_PAYMENT_REQUISITIONS'), serviceChannel ],
          write: serviceChannel
        };
      },
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^paymentAttempt\\.[A-Za-z0-9_-]+$').test(doc._id);
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
    },

    // Configuration for a payment processor
    paymentProcessorDefinition: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'CUSTOMER_PAYMENT_PROCESSORS'),
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
    },

    // A request/requisition for payment of an invoice
    paymentRequisition: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^paymentRequisition\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
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
          minimumValue: 1,
          immutable: true
        },
        issuedAt: {
          // When the payment requisition was sent/issued
          type: 'datetime',
          immutable: true
        },
        issuedByUserId: {
          // The ID of the Kashoo user that issued the payment requisition
          type: 'integer',
          minimumValue: 1,
          immutable: true
        },
        invoiceRecipients: {
          // Who received the payment requisition
          type: 'string',
          immutable: true
        }
      }
    },

    // References the payment requisitions and payment attempts that were created for an invoice
    paymentRequisitionsReference: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
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
  };
}
