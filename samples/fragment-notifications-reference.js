{
  channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    // Note that this regex uses double quotes rather than single quotes as a workaround to https://github.com/Kashoo/synctos/issues/116
    return createBusinessEntityRegex("notifications$").test(doc._id);
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
