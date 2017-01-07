{
  channels: {
    write: 'notification-transport-write'
  },
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+\\.processedTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
  },
  cannotDelete: true,
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
      immutableWhenSet: true
    }
  }
}
