{
  channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
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
}
