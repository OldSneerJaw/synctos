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
      propertyValidators: {
        businessLogoAttachment: {
          type: 'attachmentReference',
          required: false,
          maximumSize: 2097152,
          supportedExtensions: [ 'png', 'gif', 'jpg', 'jpeg' ],
          supportedContentTypes: [ 'image/png', 'image/gif', 'image/jpeg' ]
        },
        defaultInvoiceTemplate: {
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
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        }
      }
    },

    notification: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        sender: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        type: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        subject: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        message: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
          immutable: true
        },
        createdAt: {
          type: 'datetime',
          required: true,
          immutable: true
        },
        firstReadAt: {
          type: 'datetime'
        },
        siteName: {
          type: 'string',
          mustNotBeEmpty: true,
          immutable: true
        },
        actions: {
          type: 'array',
          immutable: true,
          arrayElementsValidator: {
            type: 'object',
            required: true,
            propertyValidators: {
              url: {
                type: 'string',
                required: true,
                mustNotBeEmpty: true
              },
              label: {
                type: 'string',
                required: true,
                mustNotBeEmpty: true
              }
            }
          }
        }
      }
    },

    notificationsConfig: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notificationsConfig$').test(doc._id);
      },
      propertyValidators: {
        notificationTypes: {
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
                type: 'array',
                arrayElementsValidator: {
                  type: 'object',
                  required: true,
                  propertyValidators: {
                    transportId: {
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

    notificationsReference: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notifications$').test(doc._id);
      },
      propertyValidators: {
        allNotificationIds: {
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        },
        unreadNotificationIds: {
          type: 'array',
          required: false,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        }
      }
    },

    notificationTransport: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('notificationTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        type: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        recipient: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        }
      }
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
      propertyValidators: {
        processedBy: {
          type: 'string',
          immutable: true
        },
        processedAt: {
          type: 'datetime',
          required: true,
          immutable: true
        },
        sentAt: {
          type: 'datetime'
        }
      }
    },

    paymentAttempt: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^paymentAttempt\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        businessId: {
          type: 'integer',
          minimumValue: 1,
          customValidation: validateBusinessIdProperty
        },
        invoiceRecordId: {
          type: 'integer',
          required: true,
          minimumValue: 1
        },
        paymentRequisitionId: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        paymentAttemptSpreedlyToken: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true,
        },
        date: {
          type: 'date',
          required: true
        },
        internalPaymentRecordId: {
          type: 'integer',
          minimumValue: 1
        },
        gatewayTransactionId: {
          type: 'string',
          mustNotBeEmpty: true
        },
        gatewayMessage: {
          type: 'string'
        },
        totalAmountPaid: {
          type: 'integer',
          minimumValue: 1
        },
        totalAmountPaidFormatted: {
          type: 'string',
          mustNotBeEmpty: true
        }
      }
    },

    paymentProcessorDefinition: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'CUSTOMER_PAYMENT_PROCESSORS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('paymentProcessor\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        provider: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        spreedlyGatewayToken: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        accountId: {
          type: 'integer',
          required: true,
          minimumValue: 1
        },
        displayName: {
          type: 'string'
        },
        supportedCurrencyCodes: {
          type: 'array',
          arrayElementsValidator: {
            type: 'string',
            regexPattern: iso4217CurrencyCodeRegex
          }
        }
      }
    },

    paymentRequisition: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return new RegExp('^paymentRequisition\\.[A-Za-z0-9_-]+$').test(doc._id);
      },
      propertyValidators: {
        invoiceRecordId: {
          type: 'integer',
          required: true,
          minimumValue: 1
        },
        businessId: {
          type: 'integer',
          minimumValue: 1,
          customValidation: validateBusinessIdProperty
        },
        issuedAt: {
          type: 'datetime'
        },
        issuedByUserId: {
          type: 'integer',
          minimumValue: 1
        },
        invoiceRecipients: {
          type: 'string'
        }
      }
    },

    paymentRequisitionsReference: {
      channels: toDefaultSyncChannels(doc, oldDoc, 'INVOICE_PAYMENT_REQUISITIONS'),
      typeFilter: function(doc, oldDoc) {
        return createBusinessEntityRegex('invoice\\.[A-Za-z0-9_-]+.paymentRequisitions$').test(doc._id);
      },
      propertyValidators: {
        paymentProcessorId: {
          type: 'string',
          required: true,
          mustNotBeEmpty: true
        },
        paymentRequisitionIds: {
          type: 'array',
          required: true,
          mustNotBeEmpty: true,
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        },
        paymentAttemptIds: {
          type: 'array',
          arrayElementsValidator: {
            type: 'string',
            mustNotBeEmpty: true
          }
        }
      }
    }
  };
}
