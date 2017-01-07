function() {
  // The role that confers universal privileges and is only applicable to Kashoo services
  var serviceRole = 'SERVICE';

  // A special user that has universal privileges
  var adminUser = 'ADMIN';

  // Matches values that look like three-letter ISO 4217 currency codes. It is not comprehensive.
  var iso4217CurrencyCodeRegex = new RegExp('^[A-Z]{3}$');

  // Creates a RegExp to match the ID of an entity that belongs to a business
  function createBusinessEntityRegex(suffixPattern) {
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
        view: [ toSyncChannel(businessId, 'VIEW_' + basePrivilegeName) ],
        add: [ toSyncChannel(businessId, 'ADD_' + basePrivilegeName) ],
        replace: [ toSyncChannel(businessId, 'CHANGE_' + basePrivilegeName) ],
        remove: [ toSyncChannel(businessId, 'REMOVE_' + basePrivilegeName) ]
      };
    };
  }

  var defaultAuthorizedRoles = { write: serviceRole };

  var defaultAuthorizedUsers = { write: adminUser };

  // The document type definitions. For everyone's sanity, please keep the document types in case-insensitive alphabetical order
  return {
    // The general business configuration
    business: importDocumentDefinitionFragment('fragment-business.js'),

    // A notification to be delivered to the registered notification transports for the corresponding notification type
    notification: importDocumentDefinitionFragment('fragment-notification.js'),

    // Configuration of notification transports for the business
    notificationsConfig: importDocumentDefinitionFragment('fragment-notifications-config.js'),

    // Keeps track of all notifications that have been generated for a business
    notificationsReference: importDocumentDefinitionFragment('fragment-notifications-reference.js'),

    // Configuration for a notification transport
    notificationTransport: importDocumentDefinitionFragment('fragment-notification-transport.js'),

    // A summary of the progress of processing and sending a notification via a specific notification transport method
    notificationTransportProcessingSummary: importDocumentDefinitionFragment('fragment-notification-transport-processing-summary.js'),

    // Describes an attempt to pay an invoice payment requisition, whether successful or not. May not be replaced or deleted once created.
    paymentAttempt: importDocumentDefinitionFragment('fragment-payment-attempt.js'),

    // Configuration for a payment processor
    paymentProcessorDefinition: importDocumentDefinitionFragment('fragment-payment-processor-definition.js'),

    // A request/requisition for payment of an invoice
    paymentRequisition: importDocumentDefinitionFragment('fragment-payment-requisition.js'),

    // References the payment requisitions and payment attempts that were created for an invoice
    paymentRequisitionsReference: importDocumentDefinitionFragment('fragment-payment-requisitions-reference.js')
  };
}
