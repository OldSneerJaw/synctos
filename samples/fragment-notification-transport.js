{
  channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
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
  },
  customActions: {
    onAuthorizationSucceeded: function(doc, oldDoc) {
      if (doc._deleted) {
        // The document is being removed, so ensure the user has the document's "-delete" channel in addition to one of the
        // channels defined in the document definition's "channels.remove" property
        requireAccess(doc._id + '-delete');
      } else if (oldDoc && !oldDoc._deleted) {
        // The document is being replaced, so ensure the user has the document's "-replace" channel in addition to one of the
        // channels defined in the document definition's "channels.replace" property
        requireAccess(doc._id + '-replace');
      }
    }
  }
}
